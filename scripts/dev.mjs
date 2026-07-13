import { spawn } from "node:child_process";

const children = [];
let stopping = false;

function start(command, args) {
  const child = spawn(command, args, { stdio: "inherit" });
  children.push(child);

  child.on("error", (error) => {
    console.error(`Failed to start ${command}:`, error);
    stop("SIGTERM");
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      console.error(`${command} exited unexpectedly${signal ? ` (${signal})` : ""}.`);
      stop("SIGTERM");
      process.exitCode = code ?? 1;
    }
  });

  return child;
}

function stop(signal) {
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

start("python3", ["backend/app.py", "--port", "4174"]);
start("vite", []);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => stop(signal));
}
