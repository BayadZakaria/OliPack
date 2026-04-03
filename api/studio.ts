import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prompt, type } = req.body;

    // Kanjbdou saroout (API Key) mn Vercel Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key non configurée sur le serveur." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    if (type === 'visual') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const fullPrompt = `Génère une description détaillée pour un packaging industriel : ${prompt}. Matière : bioplastique PHA premium issu de déchets d'olive. Couleur : vert émeraude.`;

      const result = await model.generateContent(fullPrompt);
      const textResponse = await result.response.text();

      return res.status(200).json({
        success: true,
        description: textResponse,
        // Image simulée 7it l'API gratuit d'image 9lil fin kaykoun mtlou9
        imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
      });
    }

    if (type === 'video') {
      // Simulation dial animation Veo
      await new Promise(resolve => setTimeout(resolve, 3000));
      return res.status(200).json({
        success: true,
        videoUrl: "https://player.vimeo.com/external/494252666.sd.mp4?s=721c606e78801d9f0a20509a27e7d667614d9b62&profile_id=164&oauth2_token_id=57447761"
      });
    }

    return res.status(400).json({ error: "Type invalide" });

  } catch (error: any) {
    console.error("Erreur API:", error);
    return res.status(500).json({ error: error.message || "Erreur interne" });
  }
}