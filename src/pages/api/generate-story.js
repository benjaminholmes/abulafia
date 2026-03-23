//This is the original generate-story file that enables the generated conspiracy to be printed out on  a thermal printer once the AI API has generated it

import axios from 'axios';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import iconv from 'iconv-lite';

const execPromise = util.promisify(exec);

// Word-wrap function to prevent splitting words across lines
function wordWrap(text, maxWidth = 45) {
  const paragraphs = text.split('\n\n');
  const wrappedParagraphs = paragraphs.map(paragraph => {
    const words = paragraph.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        if (word.length > maxWidth) {
          // Handle long words by splitting them
          for (let i = 0; i < word.length; i += maxWidth) {
            lines.push(word.slice(i, i + maxWidth));
          }
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  });
  return wrappedParagraphs.join('\n\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { prompts, model = 'grok-3', testPrint = false } = req.body;
    let story;
    if (!testPrint) {
      if (!prompts || !Array.isArray(prompts) || prompts.length !== 10) {
        return res.status(400).json({ error: 'Exactly 10 prompts are required as an array' });
      }
      const validPrompts = prompts.filter(p => typeof p === 'string' && p.trim() !== '');
      if (validPrompts.length !== 10) {
        return res.status(400).json({ error: 'All 10 prompts must be non-empty strings' });
      }
      const systemPrompt = `You are a conspiracy writer. Write a 400-word fictional conspiracy that seamlessly incorporates the following 10 themes or elements: ${validPrompts.map((p, i) => `${i + 1}. ${p}`).join('; ')}. Ensure the story is cohesive, engaging, and directly references each theme and binding them together in a web like narrative. Do not use a first person narrator. Write in the style of Thomas Pynchon without using the term Pynchonesque. Do not create characters outside of the prompted conspiracies themselves. Don't use any hyphen or dash characters. A good example for the intro for the introduction sentence is "Beneath the fractured veneer of history, a tangled web of occult machinations spins through time." But don't always emulate this example as I need variation. Use Labyrinthine, shadowed, fractured, Kafkaesque, byzantine, daedal, hetrogeneous, impenetrable, unintelligible, multifarious as examples of synonyms for complicated as well as others.  Use a large range of words to describe a a similar feeling as i need to produce many instances of this narrative. For example don't always use labyrinthine to describe the conspiracy.`;

      console.log('API Key:', process.env.XAI_API_KEY ? 'Set' : 'Missing');
      console.log('Model:', model);
      console.log('System Prompt:', systemPrompt);
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Write the 400-word story now, ensuring all 10 provided themes are included.' },
          ],
          max_tokens: 600,
          temperature: 0.8,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      story = response.data.choices[0].message.content;
    } else {
      story = "Test Print with straight quotes ' and \" to check word wrapping";
    }

    // Normalize quotes and apostrophes
    const normalizedStory = story
      .replace(/[\u2018\u2019]/g, "'") // Replace curly single quotes with straight
      .replace(/[\u201C\u201D]/g, '"'); // Replace curly double quotes with straight

    // Word-wrap the story
    const wrappedStory = wordWrap(normalizedStory, 45);

    // Generate text file for thermal printer
    const textPath = './story.txt';
    const formattedStory = `\n${wrappedStory}\n\n\n\n\n\n\n\n\n\n`;
    fs.writeFileSync(textPath, iconv.encode(formattedStory, 'win1252'));

    // Print to Star TSP143IIU
    const computerName = process.env.COMPUTERNAME || 'MSI'; 
    const printerName = 'TSP143IIU'; 
    const printerPort = 'USB001'; 
    let printSuccess = false;
    let printError = null;

    // Try copy to printer share
    try {
      const { stdout, stderr } = await execPromise(`copy "${textPath}" "\\\\${computerName}\\${printerName}"`);
      console.log('Copy command output:', stdout);
      if (stderr) console.error('Copy command stderr:', stderr);
      console.log(`Printed story to ${printerName} via share`);
      printSuccess = true;
    } catch (error) {
      console.error('Copy command error:', error.message);
      printError = error.message;
    }

    // Fallback to direct port if copy fails
    if (!printSuccess) {
      try {
        const { stdout, stderr } = await execPromise(`copy "${textPath}" "${printerPort}"`);
        console.log('Port copy command output:', stdout);
        if (stderr) console.error('Port copy command stderr:', stderr);
        console.log(`Printed story to ${printerName} via port ${printerPort}`);
        printSuccess = true;
      } catch (error) {
        console.error('Port copy command error:', error.message);
        printError = error.message;
      }
    }

    if (!printSuccess) {
      return res.status(500).json({ error: `Failed to print story: ${printError}` });
    }

    res.status(200).json({ story });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Failed to generate or print story' });
  } finally {
    // Clean up text file
    const textPath = './story.txt';
    if (fs.existsSync(textPath)) {
      fs.unlinkSync(textPath);
    }
  }
}