import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  ClipboardList,
  User,
} from "lucide-react";

import "./AIAssistant.css";

const suggestions = [
  {
    icon: ShieldCheck,
    title: "Analyze a control",
    text: "What evidence is required for SOC 2 access controls?",
  },
  {
    icon: FileCheck2,
    title: "Review evidence",
    text: "What gaps should I look for in this evidence?",
  },
  {
    icon: AlertTriangle,
    title: "Assess risk",
    text: "How should I assess a missing access review?",
  },
  {
    icon: ClipboardList,
    title: "Generate RFI",
    text: "Generate an RFI for missing security evidence.",
  },
];

function AIAssistant() {
  return (
    <div className="ai-assistant-page">

      {/* Header */}
      <div className="ai-page-header">
        <div>
          <h2>AI Assistant</h2>
          <p>
            AI-powered assistance for compliance, risk and evidence analysis.
          </p>
        </div>

        <div className="ai-status">
          <span className="status-dot"></span>
          AI Ready
        </div>
      </div>

      <div className="ai-workspace">

        {/* Chat */}
        <div className="ai-chat-panel">

          <div className="chat-header">
            <div className="chat-title">
              <div className="chat-bot-icon">
                <Bot size={21} />
              </div>

              <div>
                <strong>GRC Copilot</strong>
                <span>Compliance & Risk Assistant</span>
              </div>
            </div>

            <Sparkles size={18} className="sparkle-icon" />
          </div>

          {/* Conversation */}
          <div className="conversation">

            <div className="message assistant-message">

              <div className="message-avatar ai-avatar">
                <Bot size={16} />
              </div>

              <div className="message-content">
                <strong>GRC Copilot</strong>

                <div className="message-bubble">
                  Hi Amit 👋 I'm your GRC Copilot. I can help you analyze
                  compliance controls, review evidence, identify gaps,
                  assess risks and draft RFIs.
                </div>
              </div>

            </div>

            <div className="message user-message">

              <div className="message-content">
                <strong>You</strong>

                <div className="message-bubble">
                  What evidence would be required for a privileged access
                  review control?
                </div>
              </div>

              <div className="message-avatar user-avatar">
                <User size={16} />
              </div>

            </div>

            <div className="message assistant-message">

              <div className="message-avatar ai-avatar">
                <Bot size={16} />
              </div>

              <div className="message-content">
                <strong>GRC Copilot</strong>

                <div className="message-bubble analysis-bubble">

                  <p>
                    For a privileged access review control, the following
                    evidence would typically support the assessment:
                  </p>

                  <div className="recommendation">

                    <div className="recommendation-title">
                      <ShieldCheck size={15} />
                      Recommended Evidence
                    </div>

                    <ul>
                      <li>Latest privileged access review report</li>
                      <li>List of privileged accounts reviewed</li>
                      <li>Reviewer approval or sign-off</li>
                      <li>Review date and review frequency</li>
                      <li>Evidence of remediation for identified exceptions</li>
                    </ul>

                  </div>

                  <div className="ai-note">
                    <AlertTriangle size={14} />
                    <span>
                      The exact evidence requirement should be validated
                      against the applicable control narrative and framework.
                    </span>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Input */}
          <div className="chat-input-area">

            <div className="chat-input">

              <textarea
                placeholder="Ask about a control, evidence, risk or RFI..."
                rows="2"
              />

              <button className="send-button">
                <Send size={17} />
              </button>

            </div>

            <span className="input-note">
              AI-generated responses should be reviewed before use in
              compliance decisions.
            </span>

          </div>

        </div>

        {/* Right Panel */}
        <aside className="ai-side-panel">

          <div className="side-panel-header">
            <Sparkles size={17} />
            <h3>Quick Actions</h3>
          </div>

          <p className="side-description">
            Start with one of these common GRC tasks.
          </p>

          <div className="suggestions">

            {suggestions.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  className="suggestion-card"
                  key={item.title}
                >

                  <div className="suggestion-icon">
                    <Icon size={17} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>

                </button>
              );

            })}

          </div>

          <div className="ai-capabilities">

            <h4>AI Capabilities</h4>

            <div className="capability">
              <span>Control Analysis</span>
              <span className="enabled">Ready</span>
            </div>

            <div className="capability">
              <span>Evidence Review</span>
              <span className="enabled">Ready</span>
            </div>

            <div className="capability">
              <span>Risk Analysis</span>
              <span className="enabled">Ready</span>
            </div>

            <div className="capability">
              <span>RFI Generation</span>
              <span className="enabled">Ready</span>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default AIAssistant;