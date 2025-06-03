// Random timer function
export default function startRandomTimerForMessage()
{
    const randomTime = Math.floor(Math.random() * (50 - 5 + 1) + 5); // Random time between 5 and ? seconds---->   random()output = ? between 0 & 1 * 26[sec], + 5 [sec]
    if (DEBUGPRINTS) console.log(`Timer started for ${randomTime} seconds...`);

    setTimeout(() => {
      if (DEBUGPRINTS) console.log("Timer finished!");
      alert("hi, oof you lose one point because random timer.. time for a break, or just go outside its nice weather. ok have a nice day");

    }, randomTime * 1000); // Convert seconds to milliseconds
}