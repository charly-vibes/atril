import { parseRepoInput } from "./shared/github";

const app = document.getElementById("app");
if (!app) throw new Error("Missing #app element");

app.textContent = "atril";

// Wire up repo input when it exists
const form = document.getElementById("repo-form") as HTMLFormElement | null;
const input = document.getElementById("repo-input") as HTMLInputElement | null;
const error = document.getElementById("repo-error");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input) return;

  const ref = parseRepoInput(input.value);
  if (!ref) {
    if (error) error.textContent = "Enter a valid owner/repo slug or GitHub URL";
    return;
  }
  if (error) error.textContent = "";
  console.log("Repository:", ref);
});
