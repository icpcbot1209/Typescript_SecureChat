namespace TutorialPoint {
  export function add(x:number, y:number) { console.log(x + y); }
}

document.addEventListener('DOMContentLoaded', (_event) => {
  TutorialPoint.add(10,2);
});
