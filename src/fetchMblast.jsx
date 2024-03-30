import React, { useEffect, useState } from "react";

export default function FetchMblast({ setGreedy }) {
  const [combinedData, setCombinedData] = useState([]);
  const [gr33dyBalance, setGr33dyBalance] = useState(0);
  const [usernameInput, setUsernameInput] = useState("lucky_carrot"); // State to hold the user input

  const totalBalance = combinedData.reduce((acc, data) => {
    return (
      acc + (data && data.mblast_balance ? parseInt(data.mblast_balance) : 0)
    );
  }, 0);

  useEffect(() => {
    async function fetchData() {
      const limit = 25;
      const offsets = Array.from({ length: 81 }, (_, index) => index * limit); // Generate offsets from 0 to 2000

      try {
        const responses = await Promise.all(
          offsets.map(async (offset) => {
            const res = await fetch(
              `https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=${limit}&offset=${offset}&ordering=-mblast_balance`
            );
            return res.json();
          })
        );

        // Combine data from all responses
        const combined = responses.reduce((acc, cur) => {
          return acc.concat(cur.results);
        }, []);

        setCombinedData(combined);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 30000); // Fetch data every 30 seconds

    return () => clearInterval(interval); // Cleanup function to clear interval
  }, []); // Run only once on component mount

  useEffect(() => {
    // Find mBlast balance for the entered username
    const user = combinedData.find(
      (user) => user.user.username === usernameInput
    );
    if (user) {
      setGreedy(user);
      setGr33dyBalance(parseInt(user.mblast_balance));
    } else {
      setGr33dyBalance(0); // If user not found, set balance to 0
    }
  }, [usernameInput, combinedData, setGreedy]); // Run whenever usernameInput or combinedData changes

  const handleInputChange = (event) => {
    setUsernameInput(event.target.value);
  };

  return (
    <div className="total">
      <input
        type="text"
        value={usernameInput}
        onChange={handleInputChange}
        placeholder="Enter username"
        className="input"
      />
      <p>Total mBlast: ~{totalBalance && totalBalance.toLocaleString()}</p>
      <p className="greedy">
        {usernameInput && `${usernameInput}'s`} mBlast:{" "}
        {gr33dyBalance && gr33dyBalance.toLocaleString()}
      </p>
      <p className="greedy">
        {totalBalance &&
          gr33dyBalance &&
          ((gr33dyBalance / totalBalance) * 100).toFixed(2)}
        % owned by {usernameInput && `${usernameInput}`}
      </p>
    </div>
  );
}
