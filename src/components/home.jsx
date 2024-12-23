import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import Firebase configuration
import { Line } from "react-chartjs-2"; // Import Chart.js for graph
import { Chart as ChartJS } from "chart.js/auto"; // Automatically registers chart components
import "./home.css";

const Home = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [parameters, setParameters] = useState([]);
  const [currentParameterIndex, setCurrentParameterIndex] = useState(0); // To track the current parameter

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Fetch parameters from Firebase
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "parameters"));
        const params = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParameters(params);
      } catch (error) {
        console.error("Error fetching parameters:", error);
      }
    };

    fetchParameters();
  }, []);

  // Handle Print
  const handlePrint = () => {
    const printContent = document.getElementById("parameters-table");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Parameters</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle navigation between parameters
  const handleArrowClick = (direction) => {
    setCurrentParameterIndex((prevIndex) => {
      if (direction === "left") {
        return prevIndex === 0 ? parameters.length - 1 : prevIndex - 1;
      } else if (direction === "right") {
        return prevIndex === parameters.length - 1 ? 0 : prevIndex + 1;
      }
      return prevIndex;
    });
  };

  // Create chart data for the current parameter
  const createChartData = (parameter) => {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], // Sample months for the x-axis
      datasets: [
        {
          label: `${parameter.parameter} over time`,
          data: parameter.values, // Assuming the parameter values are an array of numbers
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          fill: true,
        },
      ],
    };
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="header-content">
          <img src="waterdrop.jpeg" id="wdrop" alt="Water Drop" />
          <h1>Aqua Sense</h1>
          <img src="profile.jpg" alt="Profile" />
        </div>
      </header>

      {/* Navbar */}
      <nav>
        <ul>
          <li
            className={activeTab === "home" ? "active" : ""}
            onClick={() => handleTabClick("home")}
          >
            Home
          </li>
          <li
            className={activeTab === "parameters" ? "active" : ""}
            onClick={() => handleTabClick("parameters")}
          >
            Parameters
          </li>
          <li
            className={activeTab === "visual representation" ? "active" : ""}
            onClick={() => handleTabClick("visual representation")}
          >
            Visual representation
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === "home" && (
          <>
            <h1>Water Level</h1>
            <img src="waterhigh.jpg" alt="Water Level Indicator" className="water-img" />
            <p className="water-level">Water level : <b>100 %</b></p>
            <div className="button-group">
              <button className="btn off-btn">OFF</button>
              <button className="btn on-btn">ON</button>
            </div>
          </>
        )}

        {activeTab === "parameters" && (
          <>
            <h1>List of Parameters</h1>
            <div id="parameters-table">
              <table className="parameters-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Parameters</th>
                    <th>Values</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param, index) => (
                    <tr key={param.id}>
                      <td>{index + 1}</td>
                      <td>{param.parameter}</td>
                      <td>{param.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn print-btn" onClick={handlePrint}>
              Print Parameters
            </button>
          </>
        )}

        {activeTab === "visual representation" && parameters.length > 0 && (
          <>
            <h1>Visual Representation</h1>
            <div className="chart-container">
              <button onClick={() => handleArrowClick("left")}>&lt;</button>
              <div className="chart">
                <Line data={createChartData(parameters[currentParameterIndex])} />
              </div>
              <button onClick={() => handleArrowClick("right")}>&gt;</button>
            </div>
            <p>{parameters[currentParameterIndex].parameter}</p>
          </>
        )}
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; 2024 Aqua Sense. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
