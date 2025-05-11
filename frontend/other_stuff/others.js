// Random timer function
export default function startRandomTimerForMessage()
{
    const randomTime = Math.floor(Math.random() * (50 - 5 + 1) + 5); // Random time between 5 and ? seconds---->   random()output = ? between 0 & 1 * 26[sec], + 5 [sec]
    console.log(`Timer started for ${randomTime} seconds...`);

    setTimeout(() => {
      console.log("Timer finished!");
      alert("hi, oof you lose one point because random timer.. you can also play cards in real life :) or just go outside or something ;) ok have a nice day");

    }, randomTime * 1000); // Convert seconds to milliseconds
}