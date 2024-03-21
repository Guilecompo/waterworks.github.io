let currentPage = 1;
let employees = [];


const onLoad = () => {
  var accountId = sessionStorage.getItem("accountId");
  if (!accountId || accountId === "0") {
      window.location.href = "/waterworks/";
  } else {
    document.getElementById("ngalan").innerText =
    sessionStorage.getItem("fullname");

    displayPaymentReports();
  }
 
};

const showNextPage = () => {
  currentPage++;
  showEmployeePage(currentPage);
};

const showPreviousPage = () => {
  if (currentPage > 1) {
    currentPage--;
    showEmployeePage(currentPage);
  } else {
    alert("You are on the first page.");
  }
};

const displayPaymentReports = () => {
  document.getElementById("dateInput").value = "";
  var url = "http://128.199.232.132/waterworks/admin/reports.php";

  axios({
      url: url,
      method: "post",
  }).then((response) => {
      try {
          var records = response.data;
          console.log(records);
          var html = `
              <table id="example" class="table table-striped table-bordered" style="width:100%">
                  <thead>
                      <tr>
                          <th class="text-center">NAME</th>
                          <th class="text-center">ZONE</th>
                          <th class="text-center">OR #</th>
                          <th class="text-center">AMOUNT</th>
                      </tr>
                  </thead>
                  <tbody>
          `;
          records.forEach((record) => {
              html += `
                  <tr>
                      <td class="text-center">${record.con_lastname}, ${record.con_firstname}</td>
                      <td class="text-center">${record.zone_name}</td>
                      <td class="text-center">${record.or_num}</td>
                      <td class="text-center">${record.pay_amount}</td>
                  </tr>
              `;
          });
          html += `
                  </tbody>
              </table>
          `;
          document.getElementById("mainDiv").innerHTML = html;
          $('#example').DataTable({
              "ordering": false // Disable sorting for all columns
          });
      } catch (error) {
          var html = `<h2>No Records</h2>`;
          document.getElementById("mainDiv").innerHTML = html;
          console.log(error);
      }
  }).catch((error) => {
      alert(`ERROR OCCURRED! ${error}`);
  });
};

// Printing Functionality
function printTable() {
  var tableContents = document.getElementById("mainDiv").querySelector("table").outerHTML;
  var printWindow = window;
  printWindow.document.body.innerHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Table</title>
        <style>
          @media print {
            body * {
              visibility: hidden;
            }
            #print-content * {
              visibility: visible;
            }
            #print-content {
              position: absolute;
              left: 0;
              top: 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          }
        </style>
      </head>
      <body>
        <div id="print-content">
          ${tableContents}
        </div>
      </body>
    </html>
  `;
  printWindow.print();
  printWindow.location.reload(); // Reload the page after printing
}
// Function to save content of mainDiv as PDF
function saveAsPDF() {
  // Create a new jsPDF instance
  var doc = new jsPDF({
      orientation: 'portrait', // Set orientation to portrait
      unit: 'in', // Set measurement unit to inches
      format: 'letter' // Set paper size to letter
  });

  // Get the HTML content of mainDiv
  var pdfContent = document.getElementById("mainDiv").innerHTML;

  // Add HTML content to the PDF
  doc.html(pdfContent, {
      callback: function (doc) {
          // Save the PDF with a specific name
          doc.save("report.pdf");
      },
      x: 0.5, // Set left margin to 0.5 inches
      y: 0.5 // Set top margin to 0.5 inches
  });
}



// Function to save content of mainDiv as Excel
function saveAsExcel() {
  // Code to convert HTML table to Excel format
  var table = document.getElementById("mainDiv").querySelector("table");
  var html = table.outerHTML;
  var blob = new Blob([html], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "report.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function filterByDate() {
  try {
    var dateInput = document.getElementById("dateInput").value;
    console.log(dateInput);

    if (!dateInput) {
      alert("Please select a date first");
      return; // Exit the function
    }

    // Check if dateInput is valid (you can add your own validation logic here)

    var url = "http://128.199.232.132/waterworks/admin/filter_reports.php";

    const formData = new FormData();
    formData.append("dateInput", dateInput);

    axios({
      url: url,
      method: "post",
      data: formData,
    }).then((response) => {
      try {
        var records = response.data;
        if (records && Array.isArray(records)) {
          var html = `
            <table id="example" class="table table-striped table-bordered" style="width:100%">
              <thead>
                <tr>
                  <th class="text-center">NAME</th>
                  <th class="text-center">ZONE</th>
                  <th class="text-center">OR #</th>
                  <th class="text-center">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
          `;
          records.forEach((record) => {
            html += `
              <tr>
                <td class="text-center">${record.con_lastname}, ${record.con_firstname}</td>
                <td class="text-center">${record.zone_name}</td>
                <td class="text-center">${record.or_num}</td>
                <td class="text-center">${record.pay_amount}</td>
              </tr>
            `;
          });
          html += `
              </tbody>
            </table>
          `;
          document.getElementById("mainDiv").innerHTML = html;
          $('#example').DataTable({
            "ordering": false // Disable sorting for all columns
          });
        } else {
          var html = `<h2>No Records</h2>`;
          document.getElementById("mainDiv").innerHTML = html;
        }
      } catch (error) {
        console.log("Error processing response:", error);
      }
    }).catch((error) => {
      alert(`ERROR OCCURRED! ${error}`);
      console.log("Axios Error:", error);
    });
  } catch (error) {
    console.log("An error occurred:", error);
  }
}


// Execute onLoad function when the page is loaded
window.onload = function() {
  onLoad();
};



