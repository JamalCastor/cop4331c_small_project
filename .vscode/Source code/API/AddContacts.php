<?php
	$inData = getRequestInfo();

	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "COP4331//x26SP", "ContactManager");

	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		$stmt = $conn->prepare("INSERT into Contacts (FirstName,LastName,Phone,Email,UserID) VALUES(?,?,?,?,?)");

		$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);

		$stmt->execute();

		$newId = $conn->insert_id;

		$stmt->close();
		$conn->close();

		returnWithInfo($newId);
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError($err)
	{
		$retValue = '{"newId":0,"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	function returnWithInfo($newId)
	{
		$retValue = '{"newId":' . $newId . ',"error":""}';
		sendResultInfoAsJson($retValue);
	}
?>