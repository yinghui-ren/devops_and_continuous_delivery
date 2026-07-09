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
        --black: #111111;
        --text: #242424;
        --muted: #686868;
        --line: #d8d8d8;
        --soft: #f3f3f1;
        --red: #d71920;
        --dark-red: #9d1117;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Arial, Helvetica, sans-serif;
        color: var(--text);
        background: #ffffff;
      }

      main {
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto;
        padding: 26px 0 38px;
      }

      .masthead {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: center;
        border-bottom: 1px solid var(--black);
        padding-bottom: 18px;
        margin-bottom: 34px;
      }

      .kicker {
        color: var(--red);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .date {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
      }

      .hero {
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 34px;
        align-items: stretch;
        margin-bottom: 34px;
      }

      h1 {
        margin: 12px 0 20px;
        color: var(--black);
        font-size: clamp(42px, 7vw, 84px);
        line-height: 0.94;
        font-weight: 800;
      }

      .lead {
        max-width: 680px;
        margin: 0;
        color: #3f3f3f;
        font-size: 20px;
        line-height: 1.45;
      }

      .report-meta {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        margin-top: 34px;
      }

      .meta-item {
        padding: 16px 18px 16px 0;
        border-right: 1px solid var(--line);
      }

      .meta-item:last-child {
        border-right: 0;
        padding-left: 18px;
      }

      .meta-item small {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
      }

      .meta-item strong {
        color: var(--black);
        font-size: 18px;
      }

      .visual {
        position: relative;
        min-height: 430px;
        overflow: hidden;
        background: var(--soft);
        border-left: 10px solid var(--red);
        padding: 26px;
      }

      .road {
        position: absolute;
        right: -80px;
        bottom: -120px;
        width: 560px;
        height: 360px;
        border-top: 76px solid #202020;
        transform: rotate(-18deg);
      }

      .road::before,
      .road::after {
        content: "";
        position: absolute;
        top: -44px;
        width: 92px;
        height: 8px;
        background: #ffffff;
      }

      .road::before {
        left: 120px;
      }

      .road::after {
        left: 278px;
      }

      .speed-line {
        position: absolute;
        height: 2px;
        background: var(--red);
        opacity: 0.9;
      }

      .line-one {
        top: 90px;
        right: 40px;
        width: 260px;
      }

      .line-two {
        top: 132px;
        right: 98px;
        width: 178px;
      }

      .line-three {
        top: 174px;
        right: 20px;
        width: 224px;
      }

      .car {
        position: absolute;
        right: 138px;
        bottom: 104px;
        width: 250px;
        height: 86px;
        transform: rotate(-18deg);
      }

      .car-body {
        position: absolute;
        left: 12px;
        bottom: 18px;
        width: 210px;
        height: 42px;
        background: var(--red);
        border-radius: 4px 18px 6px 6px;
      }

      .car-body::before {
        content: "";
        position: absolute;
        left: 48px;
        top: -30px;
        width: 90px;
        height: 34px;
        background: var(--dark-red);
        clip-path: polygon(20% 0, 78% 0, 100% 100%, 0 100%);
      }

      .wheel {
        position: absolute;
        bottom: 5px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #121212;
        border: 6px solid #5b5b5b;
      }

      .wheel.front {
        right: 34px;
      }

      .wheel.back {
        left: 38px;
      }

      .visual-copy {
        position: relative;
        z-index: 2;
        width: 52%;
      }

      .visual-copy h2 {
        margin: 0 0 12px;
        color: var(--black);
        font-size: 28px;
        line-height: 1.12;
      }

      .visual-copy p {
        margin: 0;
        color: var(--muted);
        line-height: 1.5;
      }

      .sections {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 32px;
        align-items: start;
      }

      .section-title {
        margin: 0 0 18px;
        color: var(--black);
        font-size: 22px;
        border-bottom: 3px solid var(--red);
        padding-bottom: 12px;
      }

      .pipeline {
        display: grid;
        gap: 0;
        border-top: 1px solid var(--line);
      }

      .step {
        display: grid;
        grid-template-columns: 72px 1fr 120px;
        gap: 18px;
        align-items: center;
        min-height: 74px;
        border-bottom: 1px solid var(--line);
      }

      .step-number {
        color: var(--red);
        font-size: 28px;
        font-weight: 800;
      }

      .step strong {
        display: block;
        color: var(--black);
        font-size: 17px;
        margin-bottom: 4px;
      }

      .step span {
        color: var(--muted);
        font-size: 14px;
      }

      .status {
        justify-self: end;
        color: var(--red);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .architecture {
        background: var(--black);
        color: #ffffff;
        padding: 24px;
      }

      .architecture .section-title {
        color: #ffffff;
        border-color: var(--red);
      }

      .node-list {
        display: grid;
        gap: 0;
      }

      .node {
        display: grid;
        grid-template-columns: 26px 1fr;
        gap: 14px;
        padding: 16px 0;
        border-bottom: 1px solid #3b3b3b;
      }

      .node:last-child {
        border-bottom: 0;
      }

      .dot {
        width: 14px;
        height: 14px;
        margin-top: 4px;
        background: var(--red);
        border-radius: 50%;
      }

      .node strong {
        display: block;
        margin-bottom: 5px;
        color: #ffffff;
      }

      .node span {
        color: #bdbdbd;
        line-height: 1.45;
      }

      .bars {
        margin-top: 24px;
      }

      .bar {
        margin-bottom: 16px;
      }

      .bar-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        color: #d7d7d7;
        font-size: 13px;
      }

      .bar-track {
        height: 8px;
        background: #363636;
      }

      .bar-fill {
        height: 8px;
        background: var(--red);
      }

      .w100 {
        width: 100%;
      }

      .w80 {
        width: 80%;
      }

      .w65 {
        width: 65%;
      }

      @media (max-width: 760px) {
        .masthead,
        .hero,
        .sections,
        .report-meta {
          grid-template-columns: 1fr;
          display: grid;
        }

        .visual {
          min-height: 360px;
        }

        .visual-copy {
          width: 72%;
        }

        .step {
          grid-template-columns: 46px 1fr;
        }

        .status {
          grid-column: 2;
          justify-self: start;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header class="masthead">
        <div class="kicker">Agile Auto Parts | DevOps transformation</div>
        <p class="date">CI/CD proof of concept</p>
      </header>

      <section class="hero">
        <div>
          <div class="kicker">Winning the delivery race</div>
          <h1>AAP DevOps POC</h1>
          <p class="lead">
            A focused automation demonstrator showing how code moves from GitHub to a
            controlled production server through Jenkins, a Docker agent, tests,
            deployment checks and team notification.
          </p>

          <div class="report-meta">
            <div class="meta-item">
              <small>Pipeline</small>
              <strong>Build to notify</strong>
            </div>
            <div class="meta-item">
              <small>Runtime</small>
              <strong>Node.js + PM2</strong>
            </div>
            <div class="meta-item">
              <small>Status</small>
              <strong>Production online</strong>
            </div>
          </div>
        </div>

        <div class="visual" aria-label="Stylized red car on a road">
          <div class="visual-copy">
            <h2>From manual release to repeatable delivery</h2>
            <p>Replacing zip-file handoffs with traceable pipeline execution.</p>
          </div>
          <div class="speed-line line-one"></div>
          <div class="speed-line line-two"></div>
          <div class="speed-line line-three"></div>
          <div class="road"></div>
          <div class="car">
            <div class="car-body"></div>
            <div class="wheel back"></div>
            <div class="wheel front"></div>
          </div>
        </div>
      </section>

      <section class="sections">
        <div>
          <h2 class="section-title">CI/CD Pipeline</h2>
          <div class="pipeline">
            <div class="step">
              <div class="step-number">01</div>
              <div><strong>Build</strong><span>Install application dependencies inside the Docker agent.</span></div>
              <div class="status">Automated</div>
            </div>
            <div class="step">
              <div class="step-number">02</div>
              <div><strong>Test</strong><span>Run unit tests before any production update.</span></div>
              <div class="status">Verified</div>
            </div>
            <div class="step">
              <div class="step-number">03</div>
              <div><strong>Deploy</strong><span>SSH to production, pull the approved revision and restart PM2.</span></div>
              <div class="status">Released</div>
            </div>
            <div class="step">
              <div class="step-number">04</div>
              <div><strong>Health Check</strong><span>Confirm the live /health endpoint responds after deployment.</span></div>
              <div class="status">Observed</div>
            </div>
            <div class="step">
              <div class="step-number">05</div>
              <div><strong>Notify</strong><span>Send the pipeline result to the development channel.</span></div>
              <div class="status">Reported</div>
            </div>
          </div>
        </div>

        <aside class="architecture">
          <h2 class="section-title">Deployment Architecture</h2>
          <div class="node-list">
            <div class="node">
              <div class="dot"></div>
              <div><strong>Jenkins Controller VM</strong><span>Coordinates the job and delegates execution to the agent.</span></div>
            </div>
            <div class="node">
              <div class="dot"></div>
              <div><strong>Docker Agent Host</strong><span>Runs the temporary node:22 container used for the pipeline.</span></div>
            </div>
            <div class="node">
              <div class="dot"></div>
              <div><strong>Production Server</strong><span>Hosts the Express application and PM2 process.</span></div>
            </div>
          </div>

          <div class="bars">
            <div class="bar">
              <div class="bar-label"><span>Traceability</span><span>Git based</span></div>
              <div class="bar-track"><div class="bar-fill w100"></div></div>
            </div>
            <div class="bar">
              <div class="bar-label"><span>Automation</span><span>Pipeline driven</span></div>
              <div class="bar-track"><div class="bar-fill w80"></div></div>
            </div>
            <div class="bar">
              <div class="bar-label"><span>Validation</span><span>Tests + health</span></div>
              <div class="bar-track"><div class="bar-fill w65"></div></div>
            </div>
          </div>
        </aside>
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
