async function runAnalysis() {
  const transcript = document.getElementById("input").value;

  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript })
  });

  const data = await res.json();

  document.getElementById("output").innerText =
    JSON.stringify(data, null, 2);
}
if (!parsed.evidence || parsed.evidence.length === 0) {
  console.log("⚠️ EMPTY EVIDENCE DETECTED - forcing fallback fix");
}