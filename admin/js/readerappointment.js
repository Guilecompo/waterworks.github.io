let employees = [];

const onLoad = () => {
  var accountId = sessionStorage.getItem("accountId");
  if (!accountId || accountId === "0") {
      window.location.href = "/waterworks/";
  } else {
    document.getElementById("ngalan").innerText =
    sessionStorage.getItem("fullname");
    displayAssigned();
  }
  
};

const displayAssigned = () => {
    const head = document.getElementById("head");
    head.style.display = "block";
  
    var url = "http://152.42.243.189/waterworks/admin/get_assigned.php";
    const formData = new FormData();
    formData.append("accountId", sessionStorage.getItem("accountId"));
    axios({
      url: url,
      method: "post",
      data: formData,
    })
      .then((response) => {
        console.log(response.data);
        employees = response.data;
        if (!Array.isArray(employees) || employees.length === 0) {
          errorTable();
        } else {
          consumerRefreshTables(employees);
        }
      })
      .catch((error) => {
        console.log("ERROR! - " + error);
      });
  };
  const errorTable = () => {
    var html = `
          <table id="example" class="table table-striped table-bordered" style="width:100%">
            <thead>
              <tr>
                  <th class="text-center">Full Name</th>
                  <th class="text-center">Area</th>
                  <th class="text-center">Branch</th>
                  <th class="text-center">Action</th>
              </tr>
            </thead>
            </table>`;
  
    document.getElementById("mainDiv").innerHTML = html;
  };
  const consumerRefreshTables = (employees) => {
    var html = `
          <table id="example" class="table table-striped table-bordered" style="width:100%">
            <thead>
              <tr>
                <th class="text-center">Full Name</th>
                <th class="text-center">Area</th>
                <th class="text-center">Branch</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
          `;
          employees.forEach((employee) => {
      html += `
              <tr>
                <td class="text-center">${employee.firstname} ${employee.lastname}</td>
                <td class="text-center">${employee.zone_name}</td>
                <td class="text-center">${employee.branch_name}</td>
                <td class="text-center">
                    <button style="background-color: #b91c1c; border: none; padding: 5px; border-radius: 12%; color:white;" class="clear" onclick="remove_assigned(${employee.user_id})">Remove</button>
                </td>
              </tr>
              `;
    });
    html += `</tbody></table>`;
    document.getElementById("mainDiv").innerHTML = html;
    $('#example').DataTable({
      "ordering": false // Disable sorting for all columns
    });
  };

  const remove_assigned = (user_id) => {
    console.log('You remove :', user_id);
  }

  const add_assign = () => {
    var html = `
    <div class="mb-1 mt-3">
        <h4 style="text-align: center;">Assign Meter Reader</h4>
    </div>
    <div class="container-fluid mt-3">
        <form class="row g-2 mt-4">
            <div class="col-md-6">
                <label class="form-label" for="barangay">Barangay</label><br>
                <select id="barangay" onchange="getZones()" class="form-select">
                    <option value="">Select Barangay</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label" for="employee">Meter Reader</label><br>
                <select id="employee" class="form-select" style="display: none;">
                    <option value="">Select Meter Reader</option>
                </select>
            </div>
            <div class="col-md-12">
                <label class="form-label" for="numZones">Number of Zones to Assign</label>
                <input type="number" class="form-control" id="numZones" min="1" value="1" onchange="generateSelectBoxes()" required>
            </div>
            <div class="col-md-12">
                <label class="form-label">Zone Assign</label><br>
                <div id="selectBoxesContainer"></div>
            </div>
            <div style="margin-top: 20px;">
                <button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="submit_assigned(event)">Submit</button>
            </div>
        </form>
    </div>
    `;
    document.getElementById("modalContents").innerHTML = html;

    const myModal = new bootstrap.Modal(document.getElementById('myModals'));
    myModal.show();

    getBarangay();
    generateSelectBoxes();
};
const submit_assigned = (event, user_id, branchId) => {
    console.log("USER ID: ", user_id);
    event.preventDefault();
    const municipalityId = document.getElementById("municipality").value;
    const barangayId = document.getElementById("barangay").value;
  
    const numZones = parseInt(document.getElementById("numZones").value, 10);
  
    if (isNaN(numZones) || numZones <= 0) {
      alert("Please enter a valid number of zones.");
      return;
    }
  
    // Initialize an array to store zone IDs
    const zoneIds = [];
  
    // Loop through zones based on the selected number in numZones
    for (let i = 0; i < numZones; i++) {
      const zoneId = document.getElementById("zone" + i).value;
  
      // Check if a zone is selected for each iteration
      if (!zoneId) {
        alert("Please select a zone for each entry.");
        return;
      }
  
      // Push the selected zoneId to the array
      zoneIds.push(zoneId);
    }
  
    const myUrl = "http://152.42.243.189/waterworks/gets/add_assigned.php";
    const formData = new FormData();
    formData.append("municipalityId", municipalityId);
    formData.append("barangayId", barangayId);
    formData.append("accId", user_id);
    formData.append("branchId", branchId);
    formData.append("employee_Id", sessionStorage.getItem("accountId"));
  
    console.log(municipalityId);
    console.log(barangayId);
    console.log(user_id);
    console.log(branchId);
  
    // Append each zoneId to the form data
    zoneIds.forEach((zoneId, index) => {
      formData.append(`zoneId[${index}]`, zoneId);
    });
  
    axios({
      url: myUrl,
      method: "post",
      data: formData,
    })
      .then((response) => {
        console.log(response);
        console.log(response.data);
  
        // Check the status property in the response
        if (response.data.status === 1) {
          // alert("Record Successfully Saved!");
          success_update_modal();
          // window.location.href = "./employee_list.html";
        } else if (response.data.status === 0) {
        } else {
          error_modal();
        }
      })
      .catch((error) => {
        console.error("Error in submit_assigned function:", error);
        alert(`ERROR OCCURRED! ${error.message}`);
      });
  };
  function generateSelectBoxes() {
    const numZones = document.getElementById("numZones").value;
    const selectBoxesContainer = document.getElementById("selectBoxesContainer");
    selectBoxesContainer.innerHTML = "";
    
    let row;
    for (let i = 0; i < numZones; i++) {
        if (i % 2 === 0) {
            row = document.createElement("div");
            row.className = "row";
            selectBoxesContainer.appendChild(row);
        }

        const colDiv = document.createElement("div");
        colDiv.className = "col-md-6";
        colDiv.innerHTML = `
            <div id="zoneDiv${i}">
                <select id="zone${i}" class="form-select">
                    <option value="">Select Zone</option>
                </select>
            </div>
            <br>
        `;
        row.appendChild(colDiv);
    }
    
    getZones();
}

const getZones = () => {
    const selectedBarangayId = document.getElementById("barangay").value;
    if (!selectedBarangayId) return; // Ensure barangay is selected

    const numZones = document.getElementById("numZones").value;
    const zoneUrl = "http://152.42.243.189/waterworks/gets/get_zones.php";

    const formData = new FormData();
    formData.append("barangayId", selectedBarangayId);

    axios({
        url: zoneUrl,
        method: "post",
        data: formData,
    })
    .then((response) => {
        console.log("Zones:", response.data);
        for (let i = 0; i < numZones; i++) {
            const zoneSelect = document.getElementById("zone" + i);

            // Check if zoneSelect already has a value
            if (!zoneSelect || zoneSelect.value) continue;

            zoneSelect.innerHTML = '<option value="">Select Zone</option>';

            response.data.forEach((zone) => {
                const option = document.createElement("option");
                option.value = zone.zone_id;
                option.textContent = zone.zone_name;
                zoneSelect.appendChild(option);
            });
        }
    })
    .catch((error) => {
        alert(`ERROR OCCURRED while fetching zones! ${error.message}`);
    });
};

const getBarangay = () => {
    const barangaySelect = document.getElementById("barangay");
    const barangayUrl = "http://152.42.243.189/waterworks/admin/get_barangay.php";

    axios.post(barangayUrl)
        .then((response) => {
            barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
            response.data.forEach(barangay => {
                const option = document.createElement("option");
                option.value = barangay.barangay_id;
                option.textContent = barangay.barangay_name;
                barangaySelect.appendChild(option);
            });

            // Show Meter Reader after barangay is selected
            barangaySelect.addEventListener('change', () => {
                const employeeSelect = document.getElementById("employee");
                if (barangaySelect.value) {
                    employeeSelect.style.display = "block";
                    getReaders();
                } else {
                    employeeSelect.style.display = "none";
                }
            });
        })
        .catch((error) => {
            alert(`ERROR OCCURRED! ${error}`);
        });
};

const getReaders = () => {
    const barangayId = document.getElementById("barangay").value;
    if (!barangayId) return; // Ensure barangay is selected

    const employeeSelect = document.getElementById("employee");
    const readersUrl = "http://152.42.243.189/waterworks/admin/get_readers.php";
    const formData = new FormData();
    formData.append("barangayId", barangayId);

    axios.post(readersUrl, formData)
        .then((response) => {
            employeeSelect.innerHTML = '<option value="">Select Meter Reader</option>';
            response.data.forEach(employee => {
                const option = document.createElement("option");
                option.value = employee.user_id;
                option.textContent = `${employee.firstname} ${employee.lastname}`;
                employeeSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.log(`ERROR OCCURRED! ${error}`);
        });
};
  //-----------------------------------------------------------------------------
  // Modal Functions

  const success_modals = () => {
    const modal = document.getElementById("myModals");
    const modalContent = document.getElementById("modalContents");
    var html = `
        <h5 class="modal-title" style="color: limegreen; text-align:center;">Success!</h5>
    `;
    modalContent.innerHTML = html;
    modal.style.display = "block";
  };
  
  const failed_modals = () => {
    const modal = document.getElementById("myModals");
    const modalContent = document.getElementById("modalContents");
    var html = `
    <h5 class="modal-title" style="color: red; text-align:center;">Failed!</h5>
    `;
    modalContent.innerHTML = html;
    modal.style.display = "block";
  };
  
  const error_modals = () => {
    const modal = document.getElementById("myModals");
    const modalContent = document.getElementById("modalContents");
    var html = `
        <h5 class="modal-title" style="color: red; text-align:center;">An unknown error occurred!</h5>
    `;
    modalContent.innerHTML = html;
    modal.style.display = "block";
  };
  
  const success_modal = () => {
    const modal = document.getElementById("myModal");
    const modalContent = document.getElementById("modalContent");
    var html = `
        <h5 class="modal-title" style="color: limegreen; text-align:center;">Success!</h5>
    `;
    modalContent.innerHTML = html;
    modal.style.display = "block";
  };
  
  const failed_modal = () => {
    const modal = document.getElementById("myModal");
    const modalContent = document.getElementById("modalContent");
    var html = `
    <h5 class="modal-title" style="color: red; text-align:center;">Failed!</h5>
    `;
    modalContent.innerHTML = html;
    modal.style.display = "block";
  };
  
  const error_modal = () => {
    const modal = document.getElementById("myModal");
    const modalContent = document.getElementById("modalContent");
    var html = `
        <h5 class="modal-title" style="color: red; text-align:center;">An unknown error occurred!</h5>
    `;
    modalContent.innerHTML = html;
    modal.style.display = "block";
  };
  
  const closeModal = () => {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
  
    const head = document.getElementById("head");
    const paginationNumbers = document.getElementById("paginationNumbers");
    const searchInput = document.getElementById("searchInput");
    head.style.display = "block";
  };