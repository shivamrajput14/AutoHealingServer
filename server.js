const express = require("express");
const os = require("os");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

// Health check endpoint — CloudWatch will ping this
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    host: os.hostname(),
  });
});

// System info endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    uptime: process.uptime().toFixed(2),
    memory: {
      total: (os.totalmem() / 1024 / 1024).toFixed(0) + " MB",
      free: (os.freemem() / 1024 / 1024).toFixed(0) + " MB",
      used: ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0) + " MB",
    },
    cpu: os.cpus()[0].model,
    platform: os.platform(),
    hostname: os.hostname(),
    pid: process.pid,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// Simulate crash endpoint — for testing auto-heal
app.post("/api/crash", (req, res) => {
  res.json({ message: "Crashing server in 1 second..." });
  setTimeout(() => {
    console.log("Server crash simulated!");
    process.exit(1);
  }, 1000);
});

app.get("/api/crash", (req, res) => {
  res.send("Crashing server via GET...");
  setTimeout(() => {
    console.log("Server crash simulated via GET!");
    process.exit(1);
  }, 1000);
});

app.get("/api/slow", async (req, res) => {
  console.log("Simulating slow response...");
  await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds delay
  res.send("Slow response completed");
});

app.listen(PORT, () => {
  console.log(`Auto-Heal Demo Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Started at: ${new Date().toISOString()}`);
});
