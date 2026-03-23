import axios from 'axios';

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
      const systemPrompt = `You are a conspiracy writer. Write a 400-word fictional conspiracy that seamlessly incorporates the following 10 themes or elements: ${validPrompts.map((p, i) => `${i + 1}. ${p}`).join('; ')}. Ensure the story is cohesive, engaging, and directly references each theme and binding them together in a web like narrative. Do not use a first person narrator. Write in the style of Thomas Pynchon without using the term Pynchonesque. Do not create characters outside of the prompted conspiracies themselves. Don't use any hyphen or dash characters. A good example for the intro for the introduction sentence is "Beneath the fractured veneer of history, a tangled web of occult machinations spins through time." But don't always emulate this example as I need variation. Use Labyrinthine, shadowed, fractured, Kafkaesque, byzantine, daedal, hetrogeneous, impenetrable, unintelligible, multifarious as examples of synonyms for complicated as well as others.  Use a large range of words to describe a a similar feeling as i need to produce many instances of this narrative. For example don't always use labyrinthine to describe the conspiracy. Don't include a word count`;

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
    } 


    res.status(200).json({ story });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Failed to generate story' });
   }
}