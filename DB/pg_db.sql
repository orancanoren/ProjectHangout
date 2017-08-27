CREATE TABLE Users(
	dob DATE NOT NULL,
    sex BOOLEAN  NOT NULL,
    school TEXT NOT NULL,
    occupation TEXT,
    email TEXT PRIMARY KEY,
    pwHash CHAR(60) NOT NULL,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    bio TEXT
);

CREATE INDEX ON Users (
    fname DESC,
    lname DESC
);

CREATE TABLE Vendors(
	vname TEXT PRIMARY KEY
);

CREATE TABLE Events(
	host_email CHAR(25) NOT NULL REFERENCES Users(email),
    vendor TEXT REFERENCES Vendors(vname),
    title TEXT NOT NULL,
    description TEXT,
    place TEXT NOT NULL,
    start_time DATE NOT NULL,
    end_time DATE NOT NULL,
    eid SERIAL PRIMARY KEY
);

CREATE INDEX ON Events(
    host_email DESC,
    start_time DESC
);

CREATE TABLE NotificationTexts (
    id SERIAL PRIMARY KEY,
    notif_text TEXT[]
);

CREATE INDEX ON NotificationTexts(notif_text);

CREATE TABLE Notifications(
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES Users(email),
    text_id INTEGER NOT NULL REFERENCES NotificationTexts(id),
    value_arr TEXT[],
    issued DATE,
    is_read BOOLEAN
);

CREATE INDEX ON Notifications(user_email);

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