document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("record-form");
    const tableBody = document.querySelector("#history-table tbody");
    const storageKey = "mahjong-records";
    let trendChart = null;

	function loadRecords() {
		tableBody.innerHTML = "";
		let records = JSON.parse(localStorage.getItem(storageKey)) || [];

		// 先依日期排序（由新到舊）
		records.sort((a, b) => new Date(b.date) - new Date(a.date));

		let total = 0;
		const labels = [];
		const dataPoints = [];

		records.forEach((record, index) => {
			const row = document.createElement("tr");
			row.innerHTML = `
				<td>${record.date}</td>
				<td>${record.location}</td>
				<td>${record.stake}</td>
				<td>${record.amount}</td>
				<td><button onclick="deleteRecord(${index})">刪除</button></td>
			`;
			tableBody.appendChild(row);

			total += parseFloat(record.amount);

			// Chart 用的 labels 跟 dataPoints，先收集，稍後反轉
			labels.push(record.date || `第${index + 1}場`);
			dataPoints.push(parseFloat(record.amount));
		});

		// 加總列
		const totalRow = document.createElement("tr");
		totalRow.innerHTML = `
			<td colspan="3"><strong>總輸贏</strong></td>
			<td colspan="2"><strong>${formatAmount(total)}</strong></td>
		`;
		tableBody.appendChild(totalRow);

		// 圖表 X 軸由左到右要日期由遠到近，所以資料要反轉
		renderChart(labels.reverse(), dataPoints.reverse());

		// 統計部分也用排好序的 records
		updateStats(records);
	}


    function updateStats(records) {
        let fiftyTwoTotal = 0;
        let hundredTwoTotal = 0;
        let grandTotal = 0;

        records.forEach(record => {
            const amount = parseFloat(record.amount);
            if (record.stake === "五二") {
                fiftyTwoTotal += amount;
            } else if (record.stake === "百二") {
                hundredTwoTotal += amount;
            }
            grandTotal += amount;
        });

        document.getElementById("fifty-two-total").textContent = formatAmount(fiftyTwoTotal);
        document.getElementById("hundred-two-total").textContent = formatAmount(hundredTwoTotal);
        document.getElementById("grand-total").textContent = formatAmount(grandTotal);
    }

    function formatAmount(n) {
        return (n >= 0 ? "+" : "") + n;
    }

    function renderChart(labels, dataPoints) {
        const ctx = document.getElementById("trend-chart").getContext("2d");

        if (trendChart) trendChart.destroy();

        trendChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "每場輸贏金額",
                    data: dataPoints,
                    borderColor: "#4CAF50",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: "金額"
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "日期"
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    window.deleteRecord = function(index) {
        const records = JSON.parse(localStorage.getItem(storageKey)) || [];
        records.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(records));
        loadRecords();
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const record = {
            date: document.getElementById("date").value,
            location: document.getElementById("location").value,
            stake: document.getElementById("stake").value,
            amount: document.getElementById("amount").value
        };
        const records = JSON.parse(localStorage.getItem(storageKey)) || [];
        records.push(record);
        localStorage.setItem(storageKey, JSON.stringify(records));
        form.reset();
        loadRecords();
    });
	
	document.getElementById("toggle-history").addEventListener("click", () => {
		const section = document.getElementById("history-section");
		section.style.display = section.style.display === "none" ? "block" : "none";
    });
    loadRecords();
});
