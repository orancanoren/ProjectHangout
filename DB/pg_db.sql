CREATE TABLE Users(
	dob DATE,
    sex BOOL,
    school TEXT,
    occupation TEXT,
    email TEXT PRIMARY KEY,
    pwHash CHAR(60),
    fname TEXT,
    lname TEXT,
    bio TEXT
);

CREATE TABLE Vendors(
	vname TEXT PRIMARY KEY
);

CREATE TABLE Events(
	host_email CHAR(25) REFERENCES Users(email),
    vendor TEXT REFERENCES Vendors(vname),
    title TEXT,
    description TEXT,
    place TEXT,
    start_time DATE,
    end_time DATE,
    eid SERIAL PRIMARY KEY
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