import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";

interface NoGatewayStepProps {
  onRetryDetection: () => void;
  onManualSetup: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const INSTALL_COMMANDS = {
  windows: "npm install -g clawdbot",
  macos: "npm install -g clawdbot",
  linux: "npm install -g clawdbot",
};

export function NoGatewayStep({
  onRetryDetection,
  onManualSetup,
  onBack,
  onSkip,
}: NoGatewayStepProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<"windows" | "macos" | "linux">(
    "windows",
  );

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mac")) {
      setPlatform("macos");
    } else if (userAgent.includes("linux")) {
      setPlatform("linux");
    } else {
      setPlatform("windows");
    }
  }, []);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMANDS[platform]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-8 my-auto">
        {/* Header */}
        <div
          className={cn(
            "text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-xl shadow-orange-500/20 mb-6">
            <span className="text-4xl">🦞</span>
          </div>
          <h2 className="text-4xl font-bold mb-3">Gateway Not Found</h2>
          <p className="text-lg text-muted-foreground">
            No worries! Let's get you set up with Clawdbot Gateway
          </p>
        </div>

        {/* What is Moltbot? */}
        <div
          className={cn(
            "p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 transition-all duration-700 delay-200 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h3 className="font-semibold text-lg mb-3 text-blue-600 dark:text-blue-400">
            What is Clawdbot Gateway?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Clawdbot Gateway is the <strong>local server</strong> that powers Moltz.
            Think of it like your personal AI assistant's brain — it runs on
            your computer, keeps your data private, and connects Moltz to your
            calendar, email, files, and more.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>
                <strong>100% local</strong> — your data never leaves your
                machine
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>
                <strong>Open source</strong> — full transparency, no hidden
                behavior
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>
                <strong>Easy to install</strong> — one command, runs in the
                background
              </span>
            </li>
          </ul>
        </div>

        {/* Installation steps */}
        <div
          className={cn(
            "space-y-4 transition-all duration-700 delay-400 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h3 className="font-semibold text-lg">Quick Install</h3>

          {/* Step 1: Install */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Install Clawdbot Gateway</p>
                <div className="flex items-center gap-2 bg-black/80 dark:bg-black/60 rounded-lg p-3 font-mono text-sm text-green-400">
                  <code className="flex-1">{INSTALL_COMMANDS[platform]}</code>
                  <button
                    onClick={handleCopyCommand}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium text-white transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Start */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Start the Gateway</p>
                <div className="bg-black/80 dark:bg-black/60 rounded-lg p-3 font-mono text-sm text-green-400">
                  <code>clawdbot gateway start</code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Return */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">
                  Come back here and click "I've installed it"
                </p>
              </div>
            </div>
          </div>

          {/* Need help? */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-muted-foreground">
              <strong>Need help?</strong> Check the{" "}
              <a
                href="https://github.com/yusefmosiah/Choir#installation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                installation guide
              </a>{" "}
              or ask for support in our Discord.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div
          className={cn(
            "flex flex-col gap-3 transition-all duration-700 delay-600 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <button
            onClick={onRetryDetection}
            className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            ✓ I've installed it — Retry Detection
          </button>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              ← Back
            </button>

            <button
              onClick={onManualSetup}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Enter URL Manually →
            </button>
          </div>

          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
