const urlBase = 'http://juliesin.xyz/LAMPAPI';
//const urlBase = 'http://cop4331-5.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
    
	//var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
	//var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}



function doSignup()
{
    let firstName = document.getElementById("signupFirstName").value;
    let lastName = document.getElementById("signupLastName").value;
    let login = document.getElementById("signupLogin").value;
    let password = document.getElementById("signupPassword").value;

    document.getElementById("signupResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: login,
        password: password
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Signup.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error.length > 0)
                {
                    document.getElementById("signupResult").innerHTML = jsonObject.error;
                    return;
                }

                document.getElementById("signupResult").innerHTML = "Account created successfully!";

                setTimeout(function()
                {
                    window.location.href = "index.html";
                }, 1000);
            }
        };

        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("signupResult").innerHTML = err.message;
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}


function addContact()
{
    let firstName = document.getElementById("contactFirstName").value;
    let lastName = document.getElementById("contactLastName").value;
    let phone = document.getElementById("contactPhone").value;
    let email = document.getElementById("contactEmail").value;

    document.getElementById("contactAddResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        userId: userId
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/AddContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error.length > 0)
                {
                    document.getElementById("contactAddResult").innerHTML = jsonObject.error;
                    return;
                }

                document.getElementById("contactAddResult").innerHTML = "Contact has been added";

                document.getElementById("contactFirstName").value = "";
                document.getElementById("contactLastName").value = "";
                document.getElementById("contactPhone").value = "";
                document.getElementById("contactEmail").value = "";
            }
        };

        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("contactAddResult").innerHTML = err.message;
    }
}

function searchContacts()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );

				if( jsonObject.error && jsonObject.error.length > 0 )
				{
					document.getElementById("contactSearchResult").innerHTML = jsonObject.error;
					document.getElementById("contactList").innerHTML = "";
					return;
				}

				document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					let contact = jsonObject.results[i];

					let fullName = contact.name;
					let nameParts = fullName.split(" ");
					let firstName = nameParts[0];
					let lastName = "";

					if(nameParts.length > 1)
					{
						lastName = nameParts.slice(1).join(" ");
					}

					contactList += `
						<div class="card mb-3" id="contactCard${contact.id}">
							<div class="card-body">
								<div class="d-flex justify-content-between align-items-center">
									<div>
										<strong>${contact.name}</strong>
										<br>
										<small class="text-muted">Contact ID: ${contact.id}</small>
									</div>

									<div>
										<button class="btn btn-warning btn-sm me-2" onclick="showInlineEditForm(${contact.id}, '${firstName}', '${lastName}')">
											Edit
										</button>

										<button class="btn btn-danger btn-sm" onclick="deleteContactById(${contact.id})">
											Delete
										</button>
									</div>
								</div>

								<div id="editForm${contact.id}" class="mt-3 d-none">

									<p class="text-muted small mb-3">
										<span class="text-danger">*</span> Required fields
									</p>

									<form onsubmit="event.preventDefault(); editContactById(${contact.id});">

										<div class="mb-2">
											<label class="form-label small mb-1" for="editFirstName${contact.id}">
												First Name <span class="text-danger">*</span>
											</label>
											<input 
												class="form-control" 
												type="text" 
												id="editFirstName${contact.id}" 
												value="${firstName}" 
												placeholder="First Name"
												required
											>
										</div>

										<div class="mb-2">
											<label class="form-label small mb-1" for="editLastName${contact.id}">
												Last Name <span class="text-danger">*</span>
											</label>
											<input 
												class="form-control" 
												type="text" 
												id="editLastName${contact.id}" 
												value="${lastName}" 
												placeholder="Last Name"
												required
											>
										</div>

										<div class="mb-2">
											<label class="form-label small mb-1" for="editPhone${contact.id}">
												Phone <span class="text-danger">*</span>
											</label>
											<input 
												class="form-control" 
												type="text" 
												id="editPhone${contact.id}" 
												placeholder="Phone"
												required
											>
										</div>

										<div class="mb-2">
											<label class="form-label small mb-1" for="editEmail${contact.id}">
												Email <span class="text-danger">*</span>
											</label>
											<input 
												class="form-control" 
												type="email" 
												id="editEmail${contact.id}" 
												placeholder="Email"
												required
											>
										</div>

										<button class="btn btn-success btn-sm me-2" type="submit">
											Save Changes
										</button>

										<button class="btn btn-outline-secondary btn-sm" type="button" onclick="hideInlineEditForm(${contact.id})">
											Cancel
										</button>

									</form>

									<p class="text-muted mt-2 mb-0" id="contactEditResult${contact.id}"></p>
								</div>

							</div>
						</div>
					`;
				}
				
				document.getElementById("contactList").innerHTML = contactList;
			}
		};

		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}


function editContactById(contactId)
{
	let firstName = document.getElementById("editFirstName" + contactId).value;
	let lastName = document.getElementById("editLastName" + contactId).value;
	let phone = document.getElementById("editPhone" + contactId).value;
	let email = document.getElementById("editEmail" + contactId).value;

	document.getElementById("contactEditResult" + contactId).innerHTML = "";

	let tmp = {
		contactId: contactId,
		userId: userId,
		firstName: firstName,
		lastName: lastName,
		phone: phone,
		email: email
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/EditContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error && jsonObject.error.length > 0)
				{
					document.getElementById("contactEditResult" + contactId).innerHTML = jsonObject.error;
					return;
				}

				document.getElementById("contactEditResult" + contactId).innerHTML = "Contact has been updated";
				searchContacts();
			}
		};

		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactEditResult" + contactId).innerHTML = err.message;
	}
}


function prepareEditContact(contactId, fullName)
{
	document.getElementById("editContactId").value = contactId;

	let nameParts = fullName.split(" ");
	document.getElementById("editFirstName").value = nameParts[0];

	if(nameParts.length > 1)
	{
		document.getElementById("editLastName").value = nameParts.slice(1).join(" ");
	}
	else
	{
		document.getElementById("editLastName").value = "";
	}

	document.getElementById("contactEditResult").innerHTML = "Edit the contact fields below, then click Save Changes.";
}


function deleteContactById(contactId)
{
	document.getElementById("contactDeleteResult").innerHTML = "";

	let tmp = {
		contactId: contactId,
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/DeleteContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error && jsonObject.error.length > 0)
				{
					document.getElementById("contactDeleteResult").innerHTML = jsonObject.error;
					return;
				}

				document.getElementById("contactDeleteResult").innerHTML = "Contact has been deleted";

				searchContacts();
			}
		};

		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactDeleteResult").innerHTML = err.message;
	}
}


function showInlineEditForm(contactId, firstName, lastName)
{
	document.getElementById("editForm" + contactId).classList.remove("d-none");
}

function hideInlineEditForm(contactId)
{
	document.getElementById("editForm" + contactId).classList.add("d-none");
}