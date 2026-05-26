<?php
	$inData = getRequestInfo();
	
	$contact = $inData["contact"];
	$userId = $inData["userId"];
	$newContact = $inData["newContact"];

	$conn = new mysqli("localhost", "TheBeast", "COP4331//x26SP", "ContactManager");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET Name=? WHERE UserId=? AND Name=?");
		$stmt->bind_param("sss", $newContact, $userId, $contact);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>