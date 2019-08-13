export const messages = {
    pl: {
        // bledy walidacji

        // bledy sql
        'user_exists': 'Użytkownik o podanym numerze juz istnieje.',
        'internal_server_error': "Proszę skontaktować się z działem Obsługi.",
        'invalid_code': 'Wprowadzony kod jest niepoprawny',
        'phone_dash_format': 'Numer telefonu nie moze zawierać znaku "-"',
        'phone_format': 'Nie poprawny numer telefonu',
        'phone_required': 'Numer telefonu jest wymagany',
        'user_not_created': 'Użytkownik nie został stworzony. Wystąpił błą∂',
        'user_no_exists': 'Użytkonik nie istnieje',
        'account_blocked': 'Dane konto zostało zablokowane lub jest nieaktywne',
        'user_active': 'Użytkownik już jest zarejestrowany',
        'user_ngo_max_reached': 'Liczba możłiwych wybranych Ngo została osiągnięta',
        'ngo_not_assigned': 'Ngo nie zostało przypisane. Prosimy spróbować później',
        'city_not_created': 'Miasto nie zostało zapisane',
        'trading_point_type_not_created': 'Rodzaj punktu handlowego nie został zapisany',
        'transaction_not_created': 'Tranzakcja sie nie powiodła',
        'correction_not_created': 'Korekta się nie powiodła',
        'code_format': 'Kod weryfikujący powinien zawierać tylko liczby',
        'code_max_value': 'Kod weryfikujący powinien zawierać 4 cyfry',
        'name_required': 'Imie jest wymagane',
        'name_format': 'Imie powinno zawierac sie tylko z liter',
        'email_required': 'Email jest wymagany',
        'email_format': 'Zły format adresu email',
        'ngo_type_unique_name': 'Typ ngo o takiej nazwie juz istnieje',
        //excel
        'excel_name_required': 'Rzad nr %{row} - Nazwa jest wymagana.',
        'excel_name_format': 'Rzad nr %{row} - Nazwa jest w zlym formacie.',
        'excel_type_required': 'Rzad nr %{row} - Typ jest wymagany.',
        'excel_type_format': 'Rzad nr %{row} - Typ jest w zlym formacie.',
        'excel_donation_required': 'Rzad nr %{row} - Dotacja jest wymagana.',
        'excel_donation_format': 'Rzad nr %{row} - Wartość Dotacji musi byc liczba.',
        'excel_default_vat_required': 'Rzad nr %{row} - Wartość Vat jest wymagana.',
        'excel_default_vat_format': 'Rzad nr %{row} - Wartość Vat musi byc liczba.',
        'excel_manipulation_fee_format': 'Rzad nr %{row} - Wartość Manipulacyjna musi byc liczba.',
        'excel_location_required': 'Rzad nr %{row} - Lokalizacja jest wymagana.',
        'excel_address_required': 'Rzad nr %{row} - Address jest wymagany.',
        'excel_post_code_required': 'Rzad nr %{row} - Kod pocztowy jest wymagany.',
        'excel_xp_required': 'Rzad nr %{row} - Xp jest wymagany.',
        'excel_xp_format': 'Rzad nr %{row} - Xp musi byc liczba.',
        'excel_city_required': 'Rzad nr %{row} - Miasto jest wymagane.',
        'excel_city_format': 'Rzad nr %{row} - Miasto musi skladac sie z liter.',
        'excel_account_number_required': 'Rzad nr %{row} - Numer konta bankowego jest wymanagy.',
        'excel_account_number_format': 'Rzad nr %{row} - Numer bankowy powinien zawierac tylko liczby.',
        'excel_phone_required': 'Rzad nr %{row} - Numer telefonu jest wymagany.',
        'excel_phone_format': 'Rzad nr %{row} - Numer telefonu jest w złym formacie.',
        'excel_email_required': 'Rzad nr %{row} - E-mail jest wymagany',
        'excel_email_format': 'Rzad nr %{row} - E-mail jest w zlym formacie',
        'excel_verified_required': 'Rzad nr %{row} - Weryfikacja jest wymagana',
        'excel_verified_format': 'Rzad nr %{row} - Weryfikacja powinna byc true lub false',
        'excel_verification_date_format': 'Rzad nr %{row} - Data weryfikacji jest w złym formacie',
    },
    eng: {
        'user_exists': 'User with provided phone already exists.',
        'internal_server_error': "Please contact support.",
        'invalid_code': 'Provided code is invalid',
        'phone_dash_format': 'Phone number cannot contains "-"',
        'phone_format': 'Wrong phone format',
        'phone_required': 'Phone is required',
        'user_not_created': 'Could not create user account. Please try again later',
        'user_no_exists': 'User does not exists',
        'account_blocked': 'Your account is blocked or suspended',
        'user_active': 'Your account is already registered',
        'user_ngo_max_reached': 'Maximum Ngo selection has been reached',
        'ngo_not_assigned': 'Could not assign Ngo to your account. Please try again later',
        'city_not_created': 'City could not be saved',
        'trading_point_type_not_created': 'Trading Point type could not be saved',
        'transaction_not_created': 'Transaction could not be created',
        'correction_not_created': 'Correction could not be created',
        'code_format': 'Only number are allowed in verification code',
        'code_max_value': 'Verification code should be only from 4 digits',
        'name_required': 'Name is required',
        'name_format': 'Name should only contain letters',
        'email_required': 'Email is required',
        'email_format': 'Wrong email format',
        'ngo_type_unique_name': 'Ngo type with given name already exists',

        // EXCEL :
        'excel_name_required': 'Rzad nr %{row} - Nazwa jest wymagana.',
        'excel_name_format': 'Rzad nr %{row} - Nazwa jest w zlym formacie.',
        'excel_type_required': 'Rzad nr %{row} - Typ jest wymagany.',
        'excel_type_format': 'Rzad nr %{row} - Typ jest w zlym formacie.',
        'excel_city_required': 'Rzad nr %{row} - Miasto jest wymagane.',
        'excel_city_format': 'Rzad nr %{row} - Miasto musi skladac sie z liter.',
        'excel_location_required': 'Rzad nr %{row} - Lokalizacja jest wymagana.',
        // - Trading-point
        'excel_donation_required': 'Rzad nr %{row} - Dotacja jest wymagana.',
        'excel_donation_format': 'Rzad nr %{row} - Wartość Dotacji musi byc liczba.',
        'excel_vat_required': 'Rzad nr %{row} - Wartość Vat jest wymagana.',
        'excel_vat_format': 'Rzad nr %{row} - Wartość Vat musi byc liczba.',
        'excel_manipulation_fee_format': 'Rzad nr %{row} - Wartość Manipulacyjna musi byc liczba.',
        'excel_address_required': 'Rzad nr %{row} - Address jest wymagany.',
        'excel_post_code_required': 'Rzad nr %{row} - Kod pocztowy jest wymagany.',
        'excel_xp_required': 'Rzad nr %{row} - Xp jest wymagany.',
        'excel_xp_format': 'Rzad nr %{row} - Xp musi byc liczba.',
        // - Ngo
        'excel_account_number_required': 'Rzad nr %{row} - Numer konta bankowego jest wymanagy.',
        'excel_account_number_format': 'Rzad nr %{row} - Numer bankowy powinien zawierac tylko liczby.',
        'excel_phone_required': 'Rzad nr %{row} - Numer telefonu jest wymagany.',
        'excel_phone_format': 'Rzad nr %{row} - Numer telefonu jest w złym formacie.',
        'excel_email_required': 'Rzad nr %{row} - E-mail jest wymagany',
        'excel_email_format': 'Rzad nr %{row} - E-mail jest w zlym formacie',
        'excel_verified_required': 'Rzad nr %{row} - Weryfikacja jest wymagana',
        'excel_verified_format': 'Rzad nr %{row} - Weryfikacja powinna byc true lub false',
        'excel_verification_date_format': 'Rzad nr %{row} - Data weryfikacji jest w złym formacie',
    }
};


