function home(req, res) {
  res.send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AAP DevOps POC</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #172033;
        --muted: #667085;
        --line: #d7dde8;
        --panel: #ffffff;
        --bg: #eef3f8;
        --green: #15803d;
        --blue: #2563eb;
        --amber: #b45309;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Arial, Helvetica, sans-serif;
        color: var(--ink);
        background: var(--bg);
      }

      main {
        width: min(1100px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        margin-bottom: 24px;
      }

      .brand h1 {
        margin: 0 0 6px;
        font-size: 32px;
        line-height: 1.15;
      }

      .brand p {
        margin: 0;
        color: var(--muted);
      }

      .badge {
        border: 1px solid #bbf7d0;
        background: #f0fdf4;
        color: var(--green);
        padding: 10px 14px;
        font-weight: 700;
      }

      .grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 18px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 20px;
      }

      .panel h2 {
        margin: 0 0 16px;
        font-size: 18px;
      }

      .pipeline {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
      }

      .step {
        min-height: 92px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
        background: #f8fafc;
      }

      .step strong {
        display: block;
        margin-bottom: 8px;
      }

      .step span {
        color: var(--muted);
        font-size: 14px;
      }

      .architecture {
        display: grid;
        gap: 12px;
      }

      .node {
        border-left: 5px solid var(--blue);
        background: #f8fafc;
        padding: 14px;
      }

      .node:nth-child(2) {
        border-left-color: var(--amber);
      }

      .node:nth-child(3) {
        border-left-color: var(--green);
      }

      .node strong {
        display: block;
        margin-bottom: 4px;
      }

      .node span {
        color: var(--muted);
        font-size: 14px;
      }

      .status-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 18px;
      }

      .metric {
        background: #f8fafc;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
      }

      .metric small {
        display: block;
        color: var(--muted);
        margin-bottom: 6px;
      }

      .metric strong {
        color: var(--green);
      }

      @media (max-width: 760px) {
        .topbar,
        .grid {
          grid-template-columns: 1fr;
          display: grid;
        }

        .pipeline,
        .status-row {
          grid-template-columns: 1fr;
        }

        .brand h1 {
          font-size: 26px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="topbar">
        <div class="brand">
          <h1>AAP DevOps POC</h1>
          <p>Automated delivery demo for Agile Auto Parts</p>
        </div>
        <div class="badge">Production online</div>
      </section>

      <section class="grid">
        <div class="panel">
          <h2>CI/CD Pipeline</h2>
          <div class="pipeline">
            <div class="step"><strong>Build</strong><span>Install application dependencies</span></div>
            <div class="step"><strong>Test</strong><span>Run automated unit tests</span></div>
            <div class="step"><strong>Deploy</strong><span>Update the production server</span></div>
            <div class="step"><strong>Health Check</strong><span>Verify the live endpoint</span></div>
            <div class="step"><strong>Notify</strong><span>Send a Discord result message</span></div>
          </div>

          <div class="status-row">
            <div class="metric"><small>Runtime</small><strong>Node.js</strong></div>
            <div class="metric"><small>Process</small><strong>PM2 managed</strong></div>
            <div class="metric"><small>Endpoint</small><strong>/health OK</strong></div>
          </div>
        </div>

        <div class="panel">
          <h2>Deployment Architecture</h2>
          <div class="architecture">
            <div class="node">
              <strong>GitHub Repository</strong>
              <span>Stores source code and Jenkinsfile</span>
            </div>
            <div class="node">
              <strong>Jenkins Docker Agent</strong>
              <span>Runs build, test, deploy and notification</span>
            </div>
            <div class="node">
              <strong>Production Server</strong>
              <span>Hosts the deployed Express application</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>
  `);
}

function health(req, res) {
  res.status(200).json({ status: 'OK' });
}

module.exports = {
  home,
  health,
};
