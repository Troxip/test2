import React, { useEffect, useState } from "react";
import "./App.css";
import numberWithCommas from "./components/numberFormat";
import FetchMblast from "./fetchMblast";

function App() {
  const [greedy, setGreedy] = useState(null);
  const [timerStarted, setTimerStarted] = useState(
    localStorage.getItem("timerStarted") === "true" || false
  );
  const [startTime, setStartTime] = useState(
    localStorage.getItem("startTime") || null
  );
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(
    parseInt(localStorage.getItem("elapsedTime"), 10) || 0
  );
  const [startBalance, setStartBalance] = useState(
    localStorage.getItem("startBalance") || 0
  );
  const [realTimeBalance, setRealTimeBalance] = useState(0);
  const [timerStopped, setTimerStopped] = useState(false);
  const mBlastEarned = greedy ? realTimeBalance - startBalance : 0;
  const dollarPer100k = 0.75; // Dollar amount earned per 100k mBlast
  const totalEarned = realTimeBalance
    ? (mBlastEarned / 100000) * dollarPer100k
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      if (greedy) {
        if (timerStarted) {
          setRealTimeBalance(greedy[0]?.mblast_balance || 0);
        }
      }
    };

    fetchData();
  }, [timerStarted, greedy]);

  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    const storedTimerStarted = localStorage.getItem("timerStarted");
    const storedStartBalance = localStorage.getItem("startBalance");

    if (storedTimerStarted === "true" && storedStartTime) {
      const storedElapsedTime = Math.floor(
        (Date.now() - new Date(storedStartTime)) / 1000
      );
      setElapsedTime(storedElapsedTime);
      setStartTime(new Date(storedStartTime));
      setStartBalance(parseFloat(storedStartBalance));
      setTimerStarted(true);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    const updateTimer = () => {
      const now = new Date();
      const elapsedTimeInSeconds = Math.floor(
        (now - new Date(startTime)) / 1000
      );
      setElapsedTime(elapsedTimeInSeconds);
      localStorage.setItem("elapsedTime", elapsedTimeInSeconds);

      if (timerStarted) {
        const fetchRealTimeBalance = async () => {
          if (greedy) {
            setRealTimeBalance(greedy?.mblast_balance || 0);
          }
        };
        fetchRealTimeBalance();
      }
    };

    if (timerStarted) {
      intervalId = setInterval(updateTimer, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime, timerStarted, greedy]);

  const handleTimerStart = async () => {
    const now = new Date();
    setStartTime(now.toISOString());
    localStorage.setItem("startTime", now.toISOString());

    if (greedy) {
      setGreedy(greedy);
      setStartBalance(greedy?.mblast_balance || 0);
      localStorage.setItem("startBalance", greedy?.mblast_balance || 0);
    }

    setTimerStarted(true);
    setTimerStopped(false);
    localStorage.setItem("timerStarted", true);
  };

  const handleTimerStop = () => {
    setTimerStarted(false);
    setTimerStopped(true);
    localStorage.setItem("timerStarted", false);
    localStorage.setItem("realTimeBalance", realTimeBalance);
    const now = new Date();
    const elapsedTimeInSeconds = Math.floor((now - new Date(startTime)) / 1000);
    setElapsedTime(elapsedTimeInSeconds);
    localStorage.setItem("elapsedTime", elapsedTimeInSeconds);
    setEndTime(now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }));
    localStorage.setItem("endTime", now.toISOString());
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  useEffect(() => {
    const reloadPage = () => {
      window.location.reload();
    };

    const reloadInterval = setInterval(reloadPage, 15 * 60 * 1000);

    return () => clearInterval(reloadInterval);
  }, []);

  return (
    <>
      <div className="absolute">
        <FetchMblast setGreedy={setGreedy} />
      </div>
      <div>
        <a target="_blank">
          <img
            src="https://capnco.gg/_app/immutable/assets/CapCompanyLogo.wEV2_GJJ.webp"
            className="logo"
            alt="Vite logo"
          />
        </a>
      </div>

      {timerStarted ? (
        <button
          onClick={handleTimerStop}
          className={!realTimeBalance ? "stopButton disabled" : "stopButton"}
          disabled={!realTimeBalance}
        >
          Stop / Стоп
        </button>
      ) : (
        <button onClick={handleTimerStart} className="button">
          Start Timer / Начать таймер
        </button>
      )}

      <p className={timerStarted ? "timer" : "timer stopped"}>
        {timerStarted || !timerStopped
          ? formatTime(elapsedTime)
          : formatTime(elapsedTime)}
      </p>

      <div className="card">
        <p className="h1">Statistics</p>
        <p>
          Start Balance / Начальный баланс:{" "}
          <span className={timerStopped ? "earned" : ""}>
            {numberWithCommas(startBalance)}
          </span>
        </p>
        {timerStarted ? (
          <>
            <p>
              Real-Time mBlast / В реальном времени mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(realTimeBalance)}
              </span>
            </p>
            <p>
              mBlast Earned / Заработано mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(
                  realTimeBalance
                    ? numberWithCommas(realTimeBalance - startBalance)
                    : 0
                )}
              </span>
            </p>
          </>
        ) : (
          <>
            <p>
              Real-Time mBlast / В реальном времени mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(localStorage.getItem("realTimeBalance") || 0)}
              </span>
            </p>
            <p>
              mBlast Earned / Заработано mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(
                  localStorage.getItem("realTimeBalance")
                    ? numberWithCommas(
                        localStorage.getItem("realTimeBalance") - startBalance
                      )
                    : 0
                )}
              </span>
            </p>
          </>
        )}
        <>
          <p>______________________________________</p>
          <p>
            Start Time / Время начала:{" "}
            <span className={timerStopped ? "earned" : ""}>
              {new Date(startTime).toLocaleString("ru-RU", {
                timeZone: "Europe/Moscow",
              })}
            </span>
          </p>
          {timerStopped && (
            <p>
              End Time / Время окончания:{" "}
              <span className={timerStopped ? "earned" : ""}>{endTime}</span>
            </p>
          )}
          <p>______________________________________</p>
          <p className="rate">Current Rate: ${dollarPer100k}/100k</p>
          <p>
            Total Earned / Всего заработано:{" "}
            <span className={timerStopped ? "earned" : ""}>
              ${totalEarned.toFixed(2)}
            </span>
          </p>
        </>
      </div>
    </>
  );
}

export default App;
