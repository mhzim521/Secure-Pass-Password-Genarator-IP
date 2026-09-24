const passwordEl = document.getElementById("password");
const lengthEl = document.getElementById("length");
const lengthValueEl = document.getElementById("lengthValue");
const strengthTextEl = document.getElementById("strengthText");
const strengthBars = [...document.querySelectorAll("#strengthBars i")];
const errorEl = document.getElementById("error");
const copyMessageEl = document.getElementById("copyMessage");

const options = {
  uppercase: document.getElementById("uppercase"),
  lowercase: document.getElementById("lowercase"),
  numbers: document.getElementById("numbers"),
  symbols: document.getElementById("symbols")
};

const chars = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

lengthEl.addEventListener("input", () => {
  lengthValueEl.textContent = lengthEl.value;
});

document.getElementById("generateBtn").addEventListener("click", generatePassword);
document.getElementById("copyBtn").addEventListener("click", copyPassword);

function secureRandom(max) {
  if (window.crypto && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function generatePassword() {
  errorEl.textContent = "";
  copyMessageEl.textContent = "";

  const selected = Object.keys(options).filter(key => options[key].checked);
  const length = Number(lengthEl.value);

  if (selected.length === 0) {
    passwordEl.textContent = "Select at least one option";
    strengthTextEl.textContent = "—";
    updateStrength(0);
    errorEl.textContent = "Please select at least one character type.";
    return;
  }

  if (length < selected.length) {
    passwordEl.textContent = "Increase password length";
    strengthTextEl.textContent = "—";
    updateStrength(0);
    errorEl.textContent = `Length must be at least ${selected.length}.`;
    return;
  }

  // Start with one character from each selected category.
  let passwordChars = selected.map(type => {
    const set = chars[type];
    return set[secureRandom(set.length)];
  });

  // Fill remaining positions.
  const allChars = selected.map(type => chars[type]).join("");

  while (passwordChars.length < length) {
    passwordChars.push(allChars[secureRandom(allChars.length)]);
  }

  // Fisher-Yates shuffle.
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  const password = passwordChars.join("");
  passwordEl.textContent = password;
  evaluateStrength(length, selected.length);
}

function evaluateStrength(length, types) {
  let score = 0;

  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (types >= 3) score++;
  if (types === 4 && length >= 12) score = 4;

  updateStrength(score);

  const labels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  strengthTextEl.textContent = labels[score];

  strengthTextEl.style.color =
    score <= 1 ? "#f04438" :
    score === 2 ? "#f79009" :
    score === 3 ? "#12b76a" :
    "#079455";
}

function updateStrength(score) {
  strengthBars.forEach((bar, index) => {
    bar.style.background = index < score
      ? score <= 1 ? "#f04438"
      : score === 2 ? "#f79009"
      : "#12b76a"
      : "#e4e7ec";
  });
}

async function copyPassword() {
  const password = passwordEl.textContent;

  if (!password || password.includes("Click") || password.includes("option") || password.includes("length")) {
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    copyMessageEl.textContent = "✓ Password copied!";
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = password;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    copyMessageEl.textContent = "✓ Password copied!";
  }

  setTimeout(() => {
    copyMessageEl.textContent = "";
  }, 1800);
}

generatePassword();
