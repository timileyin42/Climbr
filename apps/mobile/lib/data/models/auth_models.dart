class LoginRequest {
  final String email;
  final String password;
  LoginRequest({required this.email, required this.password});
  Map<String, dynamic> toJson() => {'email': email, 'password': password};
}

class RegisterRequest {
  final String firstName;
  final String lastName;
  final String email;
  final String password;
  RegisterRequest({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
  });
  Map<String, dynamic> toJson() => {
    'first_name': firstName,
    'last_name':  lastName,
    'email':      email,
    'password':   password,
    'user_type':  'talent',
  };
}

class AuthUser {
  final int    id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final bool   isVerified;
  final bool   profileComplete;

  const AuthUser({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isVerified,
    required this.profileComplete,
  });

  factory AuthUser.fromJson(Map<String, dynamic> j) => AuthUser(
    id:              j['id'] as int,
    email:           j['email'] as String,
    firstName:       j['first_name'] as String,
    lastName:        j['last_name']  as String,
    role:            (j['role'] ?? j['user_type']) as String? ?? 'talent',
    isVerified:      j['is_verified'] as bool? ?? false,
    profileComplete: j['profile_complete'] as bool? ?? false,
  );
}

class AuthResponse {
  final String   accessToken;
  final AuthUser user;

  const AuthResponse({required this.accessToken, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> j) => AuthResponse(
    accessToken: j['access_token'] as String,
    user:        AuthUser.fromJson(j['user'] as Map<String, dynamic>),
  );
}
