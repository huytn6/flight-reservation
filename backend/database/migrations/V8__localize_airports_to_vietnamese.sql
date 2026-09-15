-- Localize airport, city and country names shown in the Vietnamese UI.
-- IATA/ICAO codes remain unchanged so existing flights and integrations are stable.

UPDATE airports
SET
    name = CASE iata_code
        WHEN 'SGN' THEN 'Sân bay quốc tế Tân Sơn Nhất'
        WHEN 'HAN' THEN 'Sân bay quốc tế Nội Bài'
        WHEN 'DAD' THEN 'Sân bay quốc tế Đà Nẵng'
        WHEN 'PQC' THEN 'Sân bay quốc tế Phú Quốc'
        WHEN 'HPH' THEN 'Sân bay quốc tế Cát Bi'
        WHEN 'CXR' THEN 'Sân bay quốc tế Cam Ranh'
        WHEN 'DLI' THEN 'Sân bay quốc tế Liên Khương'
        WHEN 'VCA' THEN 'Sân bay quốc tế Cần Thơ'
        WHEN 'HUI' THEN 'Sân bay quốc tế Phú Bài'
        WHEN 'UIH' THEN 'Sân bay Phù Cát'
        WHEN 'BMV' THEN 'Sân bay Buôn Ma Thuột'
        WHEN 'VII' THEN 'Sân bay quốc tế Vinh'
        WHEN 'BKK' THEN 'Sân bay quốc tế Suvarnabhumi'
        WHEN 'SIN' THEN 'Sân bay quốc tế Changi Singapore'
        WHEN 'NRT' THEN 'Sân bay quốc tế Narita'
        ELSE name
    END,
    city = CASE iata_code
        WHEN 'SGN' THEN 'Thành phố Hồ Chí Minh'
        WHEN 'HAN' THEN 'Hà Nội'
        WHEN 'DAD' THEN 'Đà Nẵng'
        WHEN 'PQC' THEN 'Phú Quốc'
        WHEN 'HPH' THEN 'Hải Phòng'
        WHEN 'CXR' THEN 'Nha Trang'
        WHEN 'DLI' THEN 'Đà Lạt'
        WHEN 'VCA' THEN 'Cần Thơ'
        WHEN 'HUI' THEN 'Huế'
        WHEN 'UIH' THEN 'Quy Nhơn'
        WHEN 'BMV' THEN 'Buôn Ma Thuột'
        WHEN 'VII' THEN 'Vinh'
        WHEN 'BKK' THEN 'Bangkok'
        WHEN 'SIN' THEN 'Singapore'
        WHEN 'NRT' THEN 'Tokyo'
        ELSE city
    END,
    country = CASE country_code
        WHEN 'VN' THEN 'Việt Nam'
        WHEN 'TH' THEN 'Thái Lan'
        WHEN 'JP' THEN 'Nhật Bản'
        ELSE country
    END,
    updated_at = DATE_FORMAT(UTC_TIMESTAMP(6), '%Y-%m-%dT%H:%i:%s.%f')
WHERE iata_code IN (
    'SGN', 'HAN', 'DAD', 'PQC', 'HPH', 'CXR', 'DLI', 'VCA',
    'HUI', 'UIH', 'BMV', 'VII', 'BKK', 'SIN', 'NRT'
);
