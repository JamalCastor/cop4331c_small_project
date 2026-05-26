<?php
	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

	$conn = new mysqli("localhost", "TheBeast", "COP4331//x26SP", "ContactManager");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$hashedPassword = md5($password);
		$stmt = $conn->prepare("INSERT INTO Users (firstName,lastName,Login,Password) VALUES(?,?,?,?)");
		$stmt->bind_param("ssss", $firstName, $lastName, $login, $hashedPassword);
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