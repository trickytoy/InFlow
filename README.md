# 🧠 Inflow — Stay Focused. Think Smarter.

**Inflow** is a Chrome extension that helps you stay focused online by intelligently analyzing page content using AI. Built with [@xenova/transformers](https://github.com/xenova/transformers), Inflow uses semantic similarity models to detect distracting or off-topic content in real-time—without sending any data to external servers.

---

## 🚀 Features

- 🔍 **AI-Powered Content Analysis**  
  Uses local semantic search to evaluate page content using Transformers.js running fully in-browser (WebAssembly).

- ⏱️ **Smart Focus Sessions**  
  Launch timed sessions where Inflow monitors your tabs for content that aligns with your task. Deviate, and you'll get a gentle nudge.


- 🔐 **Privacy First**  
  All processing is done **locally**. No content ever leaves your browser.

- ⚙️ **Fully Configurable**  
  Easily define your focus goals, allowed content types, and how strict Inflow should be.

---

## 🧰 Tech Stack

- **React** — Component-based UI
- **Vite** — Lightning-fast build tool optimized for modern web apps and Chrome Extensions
- **@xenova/transformers** — Local semantic AI with WASM backend
- **Chrome Extensions (Manifest v3)** — Modern APIs for permissions, background service workers, and offscreen documents
- **WebAssembly** — Efficient in-browser inference


---

## 🛠 Installation (Development)

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/inflow.git
   cd inflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```
   This will generate a `dist/` directory with the compiled extension.

4. **Load into Chrome**:
   - Visit `chrome://extensions`
   - Enable Developer Mode
   - Click "Load Unpacked"
   - Select the `dist/` folder

---

## 🧪 Usage

1. Click the Inflow icon in your browser toolbar.
2. Start a focus session and define your topic or task.
3. Inflow runs in the background, scanning open pages for relevance.
4. If you visit a page that's semantically off-topic, Inflow will alert you or block it (depending on your chosen settings).

---

## ⚠️ Permissions

Inflow requests the following Chrome permissions:

- `tabs` — to access tab metadata and URLs
- `scripting` — to inject content analysis scripts
- `offscreen` — to run AI models securely
- `storage` — to store session data and preferences

All processing is done locally. No data is ever sent to external servers.

---

## 📄 Privacy & Security

Your privacy is our priority. Inflow performs all semantic analysis locally, using models loaded into WebAssembly via the browser. No browsing data, page content, or personal information is ever transmitted externally.

See [PRIVACY.md](./PRIVACY.md) for more details.

---

## 🧠 AI Model Info

Inflow uses a quantized version of Xenova's sentence-transformers models. These are optimized for speed and size, allowing real-time inference directly in your browser.

- Models are loaded as `.onnx` files compiled to WASM
- Runs fully offline after initial install

---

## 🙋 FAQ

**Q: Does Inflow block websites?**  
A: It can, depending on your session settings. You can choose between passive alerts or active blocking.

**Q: Does it work offline?**  
A: Yes! Once installed, everything runs locally.

**Q: Is it customizable?**  
A: Absolutely. You can configure focus duration, semantic similarity thresholds, and which sites to allow or block.

---

## 📢 Feedback & Contributions

We welcome all feedback, feature requests, and contributions!

- Found a bug? [Open an issue](https://github.com/your-username/inflow/issues)
- Want to contribute? Check out [CONTRIBUTING.md](./CONTRIBUTING.md)
- Have questions? Start a discussion in the [Discussions tab](https://github.com/your-username/inflow/discussions)

---

## 🪪 License

This project is licensed under the MIT License.  
See [LICENSE](./LICENSE) for details.

---

Made with 🧠 by [Your Name](https://github.com/your-username)
