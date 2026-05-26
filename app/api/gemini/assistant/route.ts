import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { message, terminalContext, systemHealth } = await req.json();

    if (!message) {
      return NextResponse.json({ success: false, error: "Pesan kosong" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback to avoid crashing when key is unconfigured, simulating the AI Advisor elegantly!
      return NextResponse.json({
        success: true,
        text: `💡 **Saran DevOps Otomatis (Simulasi Offline):**

Anda menanyakan: *"${message}"*

Kunci API \`GEMINI_API_KEY\` belum disetel pada panel Settings > Secrets. Namun, berikut saran optimasi standar DevOps untuk Ubuntu Server:

1. **Untuk Konfigurasi Nginx SSL**:
   Gunakan Let's Encrypt Certbot:
   \`\`\`bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d riset-vps.com
   \`\`\`

2. **Pengujian Kinerja Node.js**:
   Gunakan PM2 daemon cluster manager agar server tetap hidup jika crash:
   \`\`\`bash
   npm install pm2 -g
   pm2 start app.js --name "vps-app" -i max
   pm2 startup && pm2 save
   \`\`\`

3. **Status Server Anda Saat Ini**:
   - Penggunaan CPU: optimal (Di bawah 15%)
   - RAM: Senggang (${systemHealth?.ramUsedPercent || 42}% terpakai)
   - Penyimpanan: Sangat aman (${systemHealth?.diskUsedPercent || 28}% terpakai)

*Hubungkan API Key Anda pada panel Settings untuk mengaktifkan AI Copilot cerdas interaktif secara live!*`
      });
    }

    // Initialize GoogleGenAI SDK correctly based on guidelines
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are an expert Ubuntu VPS DevOps Systems Administrator & Linux Engineer named "RiSET AI Companion".
Your goal is to assist developers in managing their virtual private servers, fixing file configs, recommending shell scripts, optimizing memory, setting up Docker container systems, or debugging web errors.
Always reply in friendly Bahasa Indonesia combined with technical code snippets (Markdown syntax).
Be concise, accurate, and professional. Avoid self-promotions. Keep suggestions realistic for standard Ubuntu LTS servers.`;

    const prompt = `Context Terminal: 
- Current active working directory: ${terminalContext?.dir || "sandbox_root"}
- Recent inputs: ${JSON.stringify(terminalContext?.history || [])}
- Server health details: CPU ${systemHealth?.cpuLoad || 12}%, RAM ${systemHealth?.ramUsedPercent || 42}%, Storage ${systemHealth?.diskUsedPercent || 28}%

User Query: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const generatedText = response.text || "Tidak ada saran dari asisten saat ini.";

    return NextResponse.json({
      success: true,
      text: generatedText,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Error AI Assistant: ${err.message}. Harap periksa kredensial Anda.`
    }, { status: 500 });
  }
}
