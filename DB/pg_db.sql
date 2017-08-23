CREATE TABLE Users(
	dob DATE,
    sex BOOL,
    school CHAR(35),
    occupation CHAR(25),
    email CHAR(25) PRIMARY KEY,
    fname CHAR(25),
    lname CHAR(25),
    bio TEXT
);

CREATE TABLE Vendors(
	vname CHAR(35) PRIMARY KEY
);

CREATE TABLE Events(
	host_email CHAR(25) PRIMARY KEY
    	REFERENCES Users(email),
    vendor CHAR(35) REFERENCES Vendors(vname),
    title CHAR(35),
    description TEXT,
    place TEXT
);

CREATE OR REPLACE FUNCTION vendor_insertion() RETURNS TRIGGER AS
$BODY$
BEGIN
	INSERT INTO Vendors(vname)
    SELECT NEW.vendor
    WHERE NOT EXISTS (SELECT Vname FROM Vendors WHERE Vname=NEW.vendor);
    RETURN NEW;
END
$BODY$
language plpgsql;

CREATE TRIGGER pre_events_insertion BEFORE INSERT ON Events
	FOR EACH ROW
    EXECUTE PROCEDURE vendor_insertion();