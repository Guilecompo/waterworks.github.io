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
                    <button style="background-color: #b91c1c; border: none; padding: 5px; border-radius: 12%; color:white;" class="clear" onclick="remove_confirmation(${employee.assign_id}, '${employee.firstname}', '${employee.lastname}', '${employee.zone_name}', '${employee.branch_name}')">Remove</button>
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

const remove_confirmation = (assign_id, firstname, lastname, zone_name, branch_name) => {
    const modal = document.getElementById("myModals");
    const modalContent = document.getElementById("modalContents");
    const modalTitle = modal.querySelector(".modal-title");

    // Set the modal title
    modalTitle.textContent = `Remove Assignment Confirmation`;

    var html = `
        <div class="container-fluid">
            <div class="col-md-12">
                <div class="row z-depth-3">
                    <div class="col-md-12 rounded-right">
                        <div class="car-block text-center">
                            <h5 class="modal-title" style="text-align:center;">Are you sure you want to remove assigned from <span style= "color: green;">${firstname} ${lastname}</span> in <span style= "color: green;">${zone_name} ${branch_name}</span>?</h5>
                        </div>
                        <div class="row mt-4">
                            <div class="col-sm-5">
                                <button type="button" class="btn btn-danger w-100" onclick="remove_assigned(${assign_id})">Yes</button>
                            </div>
                            <div class="col-sm-2 my-1"></div>
                            <div class="col-sm-5">
                                <button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="closeModal()">No</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalContent.innerHTML = html;
    modal.style.display = "block"; // Display the modal

    // Use Bootstrap's modal method to show the modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
};
  const remove_assigned = (assign_id) => {
    var url = "http://152.42.243.189/waterworks/gets/update_assigned.php";
    const formData = new FormData();
    formData.append("employee_Id", sessionStorage.getItem("accountId"));
    formData.append("assign_id", assign_id);
    axios({
      url: url,
      method: "post",
      data: formData,
    })
    .then((response) => {
      console.log(response);
      console.log("Responses : ", response);
      if (response.data.status === 1) {
        success_modals();
        displayAssigned();
        //window.location.href = "./addconsumer.html";
      } else if (response.data.status === 0) {
        // alert("Username or phone number already exists!");
        console.log(response.data.message || "An error occurred.");
        failed_modals();
      } else {
        console.log("Unexpected response:", response.data);
        error_modals();
      }
    })
    .catch((error) => {
      alert(`ERROR OCCURRED! ${error}`);
    });
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
                <select id="barangay" onchange="getReaders(); getZones();" class="form-select">
                    <option value="">Select Barangay</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label" for="user_id">Meter Reader</label><br>
                <select id="user_id" class="form-select" >
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
                <button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="submitSelected()">Submit</button>
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
const submitSelected = () => {
    const userSelect = document.getElementById("user_id");
    const user_id = userSelect.value;
    const branchId = userSelect.options[userSelect.selectedIndex].getAttribute("data-branch-id");

    if (!user_id || !branchId) {
        alert("Please select a Meter Reader.");
        return;
    }

    // Call submit_assigned and pass the userId and branchId
    submit_assigned(event, user_id, branchId);
};

const submit_assigned = (event, user_id, branchId) => {
    console.log("USER ID: ", user_id);
    event.preventDefault();
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
    formData.append("barangayId", barangayId);
    formData.append("accId", user_id);
    formData.append("branchId", branchId);
    formData.append("employee_Id", sessionStorage.getItem("accountId"));
  
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
          success_modals();
          displayAssigned();
          // window.location.href = "./employee_list.html";
        } else if (response.data.status === 0) {
            failed_modals();
        } else {
          error_modals();
        }
      })
      .catch((error) => {
        console.error("Error in submit_assigned function:", error);
        alert(`ERROR OCCURRED! ${error.message}`);
      });
  };
function generateSelectBoxes() {
    var numZones = document.getElementById("numZones").value;
    var selectBoxesContainer = document.getElementById("selectBoxesContainer");
    selectBoxesContainer.innerHTML = "";
  
    var row;
  
    for (let i = 0; i < numZones; i++) {
      if (i % 2 === 0) {
        row = document.createElement("div");
        row.className = "row";
        selectBoxesContainer.appendChild(row);
      }
  
      var colDiv = document.createElement("div");
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
  
    // Check if numZones is a valid number
    var numZones = document.getElementById("numZones").value;
    if (isNaN(numZones) || numZones <= 0) {
      alert("Please enter a valid number of zones.");
      return;
    }
  
    const zoneUrl = "http://152.42.243.189/waterworks/gets/get_zones.php";
  
    const formData = new FormData();
    formData.append("barangayId", selectedBarangayId);
  
    axios({
      url: zoneUrl,
      method: "post",
      data: formData,
    })
      .then((response) => {
        console.log("Response data:", response.data);
  
        for (let i = 0; i < numZones; i++) {
          const zoneSelect = document.getElementById("zone" + i);
  
          if (!zoneSelect) {
            console.warn(`Element with id 'zone${i}' not found.`);
            continue;
          }
  
          zoneSelect.innerHTML = '<option value="">Select Zone</option>';
  
          for (let j = 0; j < response.data.length; j++) {
            const zone = response.data[j];
  
            if (
              !zone ||
              typeof zone !== "object" ||
              !("zone_id" in zone) ||
              !("zone_name" in zone)
            ) {
              console.error(
                `Invalid zone data at index ${j}. Expected an object with 'zone_id' and 'zone_name'.`
              );
              continue;
            }
  
            const option = document.createElement("option");
            option.value = zone.zone_id;
            option.textContent = zone.zone_name;
            zoneSelect.appendChild(option);
          }
        }
      })
      .catch((error) => {
        alert(`ERROR OCCURRED while fetching zones! ${error.message}`);
      });
  };
  
  const getMunicipality = () => {
    const municipalitySelect = document.getElementById("municipality");
    var myUrl = "http://152.42.243.189/waterworks/gets/get_municipality.php";
  
    axios({
      url: myUrl,
      method: "post",
    })
      .then((response) => {
        var municipalities = response.data;
  
        var options = ``;
        municipalities.forEach((municipality) => {
          options += `<option value="${municipality.municipality_id}">${municipality.municipality_name}</option>`;
        });
        municipalitySelect.innerHTML = options;
  
        getBarangay();
      })
      .catch((error) => {
        alert(`ERROR OCCURRED! ${error}`);
      });
  };
  
  const getBarangay = () => {
    // const barangayName = sessionStorage.getItem("branchId");
  
    // Fetch barangays based on the selected municipality
    // Replace this URL with your actual API endpoint
    const barangayUrl = `http://152.42.243.189/waterworks/admin/get_barangay.php`;
    // const formData = new FormData();
  
    // Use selectedMunicipalityId directly
    // formData.append("barangayId", barangayName);
  
    axios({
      url: barangayUrl,
      method: "post",
    //   data: formData,
    })
      .then((response) => {
        const barangaySelect = document.getElementById("barangay");
        const barangays = response.data;
  
        // Clear existing options
        barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
  
        // Populate options for barangays
        barangays.forEach((barangay) => {
          const option = document.createElement("option");
          option.value = barangay.barangay_id;
          option.textContent = barangay.barangay_name;
          barangaySelect.appendChild(option);
        });
      })
      .catch((error) => {
        alert(`ERROR OCCURRED while fetching barangays! ${error}`);
      });
  };
//   ------------------------------------------------------------------------------

const getReaders = () => {
    const barangaySelect = document.getElementById("barangay");
    const employeeSelect = document.getElementById("user_id");

    // Ensure employee select dropdown is displayed
    employeeSelect.style.display = 'block';

    // Fetch the selected barangay value
    const selectedBarangayId = barangaySelect.value;

    // Proceed only if a barangay is selected
    if (!selectedBarangayId) {
        console.log("No barangay selected.");
        return;
    }

    const myUrl = "http://152.42.243.189/waterworks/admin/get_readers.php";
    const formData = new FormData();
    formData.append("barangayId", selectedBarangayId); // Append selected value, not the element

    axios({
        url: myUrl,
        method: "post",
        data: formData
    })
    .then((response) => {
        var employees = response.data;

        // Clear existing options
        employeeSelect.innerHTML = '<option value="">Select Meter Reader</option>';

        // Populate employee options
        employees.forEach((employee) => {
            const option = document.createElement("option");
            option.value = employee.user_id;
            option.textContent = `${employee.firstname} ${employee.lastname}`;
            option.setAttribute("data-branch-id", employee.branchId);  // Store branchId in data attribute
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
    const modal = document.getElementById("myModals");
    modal.style.display = "none";
  
    const head = document.getElementById("head");
    const paginationNumbers = document.getElementById("paginationNumbers");
    const searchInput = document.getElementById("searchInput");
    head.style.display = "block";
  };