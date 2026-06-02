export const WORKER_IMAGES: Record<number, any> = {
  1: require("../assets/workers/worker1.png"),
  2: require("../assets/workers/worker2.png"),
  3: require("../assets/workers/worker3.png"),
  4: require("../assets/workers/worker4.png"),
  5: require("../assets/workers/worker5.png"),
  6: require("../assets/workers/worker6.png"),
  7: require("../assets/workers/worker7.png"),
  8: require("../assets/workers/worker8.png"),
};

export const getWorkerImage = (
  workerId: string | number | undefined | null,
) => {
  if (!workerId) return null;

  const idStr = String(workerId).trim().toLowerCase();
  const totalImages = Object.keys(WORKER_IMAGES).length;

  if (totalImages === 0) return null;

  const idHash = idStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageKey = (idHash % totalImages) + 1;

  return WORKER_IMAGES[imageKey];
};
