<?php

	$inData = getRequestInfo();

	if ($inData == null)
	{
		echo "API is running";
		return;
	}
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "COP4331//x26SP", "ContactManager");

	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
		$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Contacts WHERE FirstName LIKE ? AND UserID=?");

		$contactName = "%" . $inData["search"] . "%";

		$stmt->bind_param("si", $contactName, $inData["userId"]);

		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if($searchCount > 0)
			{
				$searchResults .= ",";
			}

			$searchCount++;

			$searchResults .= '{"id":' . $row["ID"] . ',"name":"' . $row["FirstName"] . ' ' . $row["LastName"] . '"}';
		}
		
		if($searchCount == 0)
		{
			returnWithError("No Records Found");
		}
		else
		{
			returnWithInfo($searchResults);
		}
		
		$stmt->close();
		$conn->close();
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
		$retValue = '{"results":[],"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithInfo($searchResults)
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson($retValue);
	}

?>