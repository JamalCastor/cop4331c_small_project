<?php
	$inData = getRequestInfo();
	
	$contact = $inData["contact"];
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "COP4331//x26SP", "ContactManager");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT into Contacts (UserId,Name) VALUES(?,?)");
		$stmt->bind_param("ss", $userId, $contact);
		$stmt->execute();

		$newId = $conn->insert_id;

		$stmt->close();
		$conn->close();
		returnWithError("", $newId);
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
	
	function returnWithError( $err, $newId = -1 )
	{
		$retValue = '{"newId":' . $newId . ',"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>