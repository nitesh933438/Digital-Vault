import { useEffect, useState } from "react";
import "./UploadChart.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import { getMonthlyUploads } from "../../services/chartService";

function UploadChart() {

  const [data, setData] = useState([]);

  useEffect(() => {

    loadChart();

  }, []);

  const loadChart = async () => {

    const chartData = await getMonthlyUploads();

    setData(chartData);

  };

  return (

    <div className="chart-card">

      <h2>Monthly Upload Analytics</h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis dataKey="month"/>

          <YAxis/>

          <Tooltip/>

          <Bar
            dataKey="uploads"
            fill="#2563eb"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}

export default UploadChart;