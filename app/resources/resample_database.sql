# MySQL script
for inserting sample data into the database


INSERT INTO VenueCategory
    (category_id, category_name, category_description)
VALUES
    (1, 'Accommodation', 'The best places to stay in town.'),
    (2, 'Cafés & Restaurants', 'The finest dining in town.'),
    (3, 'Attractions', 'The best things to see in town.'),
    (4, 'Events', 'Whats going on in town.'),
    (5, 'Nature Spots', 'The most beautiful bits of nature in town.');

INSERT INTO User
    (username, email, given_name, family_name, password)
VALUES
    ('bobby1', 'bob.roberts@gmail.com', 'Bob', 'Roberts', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'),
    ('black.panther', 'black.panther@super.heroes', 'T', 'Challa', '934002b42e50ae8aad16376317b0384f6c7bbc4dbeef4c104abafa6f7013ea17'),
    ('superman', 'superman@super.heroes', 'Clark', 'Kent', '96429f8e1cd83d58c89e4c584bc69265fd29457a6ef258a5756390c68e1afbcf'),
    ('batman', 'dark.knight@super.heroes', 'Bruce', 'Wayne', '1a7c34f43c0889267b2da7fa6cc4d06210b3d53fa02cb94f4c3730ddbc3a12be'),
    ('spiderman', 'spiderman@super.heroes', 'Peter', 'Parker', 'f6b19d96aae91f9d9eee3a34903861d4d8cb240b1623aba394d2b632ee64ddab'),
    ('ironman', 'ironman@super.heroes', 'Tony', 'Stark', 'fa7c2e6d1038abbb2ade535e6dea540203c947f7768aa5b3ad424b18768553c4'),
    ('captain.america', 'captain.america@super.heroes', 'Steve', 'Rogers', 'ce4e7763c97f24e100b9ebb9f0e18f442142aead831f81a714213b8e51c7084e'),
    ('dr.manhatten', 'dr.manhatten@super.heroes', 'Jonathan', 'Osterman', 'e7f90b0310363d697e83711832881d3aabd37e3e8c25efe3883ed8de0c4c29fb'),
    ('vampire.slayer', 'vampire.slayer@super.heroes', 'Buffy', 'Summers', '883346ce46895b7b7ada7569b95991123f9d08069b564a5c3c2a02fa45653222'),
    ('Ozymandias', 'Ozymandias@super.villains', 'Adrian', 'Veidt', '923c7d67310152adcfdb62b2e63016c7646d0e2cb9526843b81b62d72e0a5baa'),
    ('Rorschach', 'Rorschach@super.villains', 'Walter', 'Kovacs', '78a1a1dae4e56fb0aba67dadc5ab5ab808f505137efedecfb7c2f12a4195c58b'),
    ('power.woman', 'power.woman@super.heroes', 'Jessica', 'Jones', '15e40b6703e906fa32c6738125059ef978aec7b0b23a31f14a37042454bcb6b6')

INSERT INTO Venue
    (venue_id, admin_id, category_id, venue_name, city, short_description, long_description, date_added, address,
    latitude, longitude)
VALUES
    (1, 1, 2, 'The Wok', 'Christchurch', 'Home of the world-famous $2 rice', '', '2018-12-25',
        'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        -43.523617, 172.582885),
    (2, 2, 5, 'Ilam Gardens', 'Christchurch', 'Kinda pretty', '', '2019-01-01',
        '87 Ilam Rd, Ilam, Christchurch 8041, New Zealand',
        -43.524219, 172.576032),
    (3, 3, 1, 'Erskine Building', 'Christchurch', 'Many a late night has been spent here', '', '2019-01-01',
        'Erskine Science Rd, Ilam, Christchurch 8041, New Zealand',
        -43.522535, 172.581086);

INSERT INTO Review
    (reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted)
VALUES
    (1, 8, 'No more $2 rice, its all a lie.', 3, 4, '2019-02-20 22:05:24'),
    (1, 9, 'Good rice for a good price.', 4, 2, '2019-02-12 18:42:01'),
    (3, 8, 'Had to provide our own beanbags to sleep on.', 1, 0, '2018-09-28 07:42:11'),
    (3, 3, 'Good air conditioning.', 5, 0, '2018-06-01
10:31:45'),
    (3, 4, 'My favourite place on earth.', 4, 3, '2019-01-19 12:34:59');