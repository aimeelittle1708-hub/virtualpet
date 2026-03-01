const clamp = (v, lo=0, hi=10) => Math.max(lo, Math.min(hi, v));

const SPECIES = {
  fish:      { decay:{hunger:1, energy:1, hygiene:2, happiness:1}, desc:"Hygiene drops faster." },
  reptile:   { decay:{hunger:1, energy:1, hygiene:1, happiness:1}, desc:"Steady." },
  mammal:    { decay:{hunger:2, energy:1, hygiene:1, happiness:1}, desc:"Gets hungry faster." },
  insect:    { decay:{hunger:1, energy:2, hygiene:1, happiness:1}, desc:"Tires quickly." },
  mollusc:   { decay:{hunger:1, energy:1, hygiene:1, happiness:2}, desc:"Moodier." },
  fungi:     { decay:{hunger:1, energy:1, hygiene:1, happiness:1}, desc:"Low drama." },
  bird:      { decay:{hunger:2, energy:2, hygiene:1, happiness:1}, desc:"High metabolism." },
  amphibian: { decay:{hunger:1, energy:1, hygiene:2, happiness:1}, desc:"Hygiene drops faster." },
};

const ADULT_BRANCHES = {
  fish: ["Koi", "Catfish"],
  reptile: ["Gecko", "Croc"],
  mammal: ["Bunny", "Wolf"],
  insect: ["Butterfly", "Beetle"],
  mollusc: ["Pearl Snail", "Slug Knight"],
  fungi: ["Toadstool Sage", "Mold Beast"],
  bird: ["Songbird", "Raven"],
  amphibian: ["Tree Frog", "Salamander"],
};

const EGG_FRAMES = {
  fish: [
`  .-.
.'   '.
/  ~~~ \\
| ~~~~ |
\\  ~~~ /
 '.___.'`,
`  .-.
.'   '.
/  ~~/ \\
| ~~ /~ |
\\  /~~ /
 '.___.'`,
`  .-.
.'  /'.
/  /~/ \\
| ~/ /~~ |
\\  ~~\\  /
 '.___.'`,
`\\  |  /
 \\ | /
-- 💦 --
 / | \\
/  |  \\`
],
  reptile: [
`  .-.
.' ^ '.
/  ^^^ \\
|^^^^^^|
\\  ^^^ /
 '.___.'`,
`  .-.
.' ^ '.
/  ^^/ \\
|^ /^^^|
\\  /^^ /
 '.___.'`,
`  .-.
.' ^/'.
/  /^^ \\
|^/ /^^^|
\\  ^^/ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 🦎 --
 / | \\
/  |  \\`
],
  mammal: [
`  .-.
.' o '.
/  ooo \\
|oooooo|
\\  ooo /
 '.___.'`,
`  .-.
.' o '.
/  oo/ \\
|oo /ooo|
\\  /oo /
 '.___.'`,
`  .-.
.' o/'.
/  /oo \\
|o/ /ooo|
\\  oo/ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 🐾 --
 / | \\
/  |  \\`
],
  insect: [
`  .-.
.' * '.
/  *** \\
|******|
\\  *** /
 '.___.'`,
`  .-.
.' * '.
/  **/ \\
|** /***|
\\  /** /
 '.___.'`,
`  .-.
.' */'.
/  /** \\
|*/ /***|
\\  **/ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 🦋 --
 / | \\
/  |  \\`
],
  mollusc: [
`  .-.
.' @ '.
/  @@@ \\
|@@@@@@|
\\  @@@ /
 '.___.'`,
`  .-.
.' @ '.
/  @@/ \\
|@@ /@@@|
\\  /@@ /
 '.___.'`,
`  .-.
.' @/'.
/  /@@ \\
|@/ /@@@|
\\  @@/ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 🐚 --
 / | \\
/  |  \\`
],
  fungi: [
`  .-.
.' _ '.
/  ___ \\
|(___) |
\\  ___ /
 '.___.'`,
`  .-.
.' _ '.
/  __/ \\
|(_ /_)|
\\  /__ /
 '.___.'`,
`  .-.
.' _/'.
/  /__ \\
|(_/ /_)|
\\  __/ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 🍄 --
 / | \\
/  |  \\`
],
  bird: [
`  .-.
.' v '.
/  vvv \\
|vvvvvv|
\\  vvv /
 '.___.'`,
`  .-.
.' v '.
/  vv/ \\
|vv /vvv|
\\  /vv /
 '.___.'`,
`  .-.
.' v/'.
/  /vv \\
|v/ /vvv|
\\  vv/ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 🪶 --
 / | \\
/  |  \\`
],
  amphibian: [
`  .-.
.' . '.
/  ... \\
|......|
\\  ... /
 '.___.'`,
`  .-.
.' . '.
/  ../ \\
|.. /...|
\\  /.. /
 '.___.'`,
`  .-.
.' ./'.
/  /.. \\
|./ /...|
\\  ../ /
 '.___.'`,
`\\  |  /
 \\ | /
-- 💧 --
 / | \\
/  |  \\`
],
};

const BABY_SPRITE = {
  fish: "   ><(((o)",
  reptile: "  __\\_/__",
  mammal: "  (\\_/)",
  insect: "  \\_/\\/\\_/",
  mollusc: "  _@)_/",
  fungi: "   _._",
  bird: "  (v)",
  amphibian: "  (.. )",
};

const $ = (id) => document.getElementById(id);

const statsOrder = ["hunger","happiness","energy","hygiene","health"];
const statsEl = $("stats");

function makeStatRow(key){
  const wrap = document.createElement("div");
  wrap.className = "stat";
  wrap.innerHTML = `
    <div class="statline">
      <span>${key[0].toUpperCase()+key.slice(1)}</span>
      <span id="${key}Val"></span>
    </div>
    <div class="bar"><div class="fill" id="${key}Bar"></div></div>
  `;
  return wrap;
}
statsOrder.forEach(k => statsEl.appendChild(makeStatRow(k)));

let pet = null;
let timer = null;

function log(msg){ $("log").textContent = msg || ""; }

function setFill(key, val){
  $(key+"Val").textContent = `(${val}/10)`;
  $(key+"Bar").style.width = (val*10) + "%";
}

function stageFromAge(age){
  if (age < 3) return "Baby";
  if (age < 7) return "Child";
  if (age < 12) return "Teen";
  if (age < 18) return "Adult";
  return "Elder";
}

function chooseAdultForm(species, carePoints){
  const [good, tough] = ADULT_BRANCHES[species];
  let pGood = 0.5 + (carePoints / 100); // -50..+50 -> 0..1-ish
  pGood = Math.max(0.1, Math.min(0.9, pGood));
  return Math.random() < pGood ? good : tough;
}

function currentSprite(){
  if (!pet) return "(choose an egg)";
  if (pet.hatching) return pet.hatchFrameText;
  if (pet.stage === "Baby") return BABY_SPRITE[pet.species] + (pet.shiny ? " ✨" : "");
  // Simple placeholder for later: show adult form label as sprite-like
  if (pet.stage === "Adult" && pet.form) return `[ ${pet.form} ]` + (pet.shiny ? " ✨" : "");
  return (BABY_SPRITE[pet.species] || "(:)") + (pet.shiny ? " ✨" : "");
}

function render(){
  if (!pet){
    $("title").textContent = "Egg Hatchery";
    $("meta").textContent = "";
    $("sprite").textContent = "(choose an egg)";
    statsOrder.forEach(k => { setFill(k, 0); });
    disableActions(true);
    return;
  }

  $("title").textContent = `${pet.name} (${pet.species})`;
  $("meta").textContent = `Age ${pet.age} • Stage ${pet.stage}${pet.shiny ? " • SHINY✨" : ""}`;
  $("sprite").textContent = currentSprite();

  statsOrder.forEach(k => setFill(k, pet[k]));
  disableActions(pet.hatching || pet.dead);
}

function disableActions(disabled){
  ["feed","play","sleep","clean","medicate"].forEach(id => $(id).disabled = disabled);
}

function tick(){
  if (!pet || pet.hatching || pet.dead) return;

  const d = SPECIES[pet.species].decay;
  pet.hunger   = clamp(pet.hunger - d.hunger);
  pet.energy   = clamp(pet.energy - d.energy);
  pet.hygiene  = clamp(pet.hygiene - d.hygiene);
  if (Math.random() < 0.7) pet.happiness = clamp(pet.happiness - d.happiness);

  // health penalties
  if (pet.hunger <= 1) pet.health = clamp(pet.health - 2);
  if (pet.energy <= 1) pet.health = clamp(pet.health - 1);
  if (pet.hygiene <= 1) pet.health = clamp(pet.health - 1);
  if (pet.happiness <= 1) pet.health = clamp(pet.health - 1);

  if (Math.random() < 0.25) pet.age += 1;

  // care points
  const avg = (pet.hunger + pet.happiness + pet.energy + pet.hygiene)/4;
  if (avg >= 7 && pet.health >= 8) pet.care += 2;
  else if (avg >= 5) pet.care += 1;
  else if (avg <= 3 || pet.health <= 4) pet.care -= 2;
  else pet.care -= 1;
  pet.care = clamp(pet.care, -50, 50);

  // evolution
  const prevStage = pet.stage;
  pet.stage = stageFromAge(pet.age);

  if (pet.stage === "Adult" && !pet.form) {
    pet.form = chooseAdultForm(pet.species, pet.care);
    log(`✨ Evolution! Became ${pet.form}.`);
  } else if (pet.stage !== prevStage) {
    log(`✨ Evolution! Now ${pet.stage}.`);
  }

  if (pet.health <= 0){
    pet.dead = true;
    log("Your pet passed away… 😢");
    clearInterval(timer);
    timer = null;
  }

  render();
}

async function hatchAnimation(species, shiny){
  const frames = EGG_FRAMES[species];
  pet.hatching = true;
  for (let i=0;i<frames.length;i++){
    pet.hatchFrameText = frames[i] + (shiny ? "\n\n   ✨ SHINY ✨" : "");
    render();
    await new Promise(r => setTimeout(r, i === frames.length-1 ? 650 : 500));
  }
  pet.hatching = false;
  pet.hatchFrameText = "";
  render();
}

function startGame(species){
  const name = prompt("Name your pet?") || "Mochi";
  const shiny = Math.random() < 0.05;

  pet = {
    name, species, shiny,
    age: 0, stage: "Baby", form: null, care: 0,
    hunger: 7, happiness: 7, energy: 7, hygiene: 7, health: 10,
    hatching: false, hatchFrameText: "", dead: false
  };

  log(shiny ? "✨ Rare shiny egg found!" : SPECIES[species].desc);
  render();

  // run hatch animation, then start ticking
  hatchAnimation(species, shiny).then(() => {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 1200);
    log("Hatched!");
  });
}

function resetGame(){
  pet = null;
  log("");
  if (timer) clearInterval(timer);
  timer = null;
  render();
}

// Buttons
$("hatch").onclick = () => {
  const species = $("egg").value;
  if (!species) return log("Pick an egg first.");
  startGame(species);
};
$("reset").onclick = resetGame;

$("feed").onclick = () => { if(!pet||pet.hatching||pet.dead) return; pet.hunger=clamp(pet.hunger+3); pet.happiness=clamp(pet.happiness+1); render(); };
$("play").onclick = () => { if(!pet||pet.hatching||pet.dead) return; pet.happiness=clamp(pet.happiness+3); pet.energy=clamp(pet.energy-1); pet.hunger=clamp(pet.hunger-1); render(); };
$("sleep").onclick= () => { if(!pet||pet.hatching||pet.dead) return; pet.energy=clamp(pet.energy+4); pet.hunger=clamp(pet.hunger-1); render(); };
$("clean").onclick= () => { if(!pet||pet.hatching||pet.dead) return; pet.hygiene=clamp(pet.hygiene+4); pet.happiness=clamp(pet.happiness-1); render(); };
$("medicate").onclick= () => { if(!pet||pet.hatching||pet.dead) return; pet.health=clamp(pet.health + (pet.health<=6?3:1)); pet.happiness=clamp(pet.happiness-1); render(); };

render();