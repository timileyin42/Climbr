// ── Profile ───────────────────────────────────────────────────────────────────

class TalentProfile {
  final int     id;
  final String  firstName;
  final String  lastName;
  final String  email;
  final String? bio;
  final String? phone;
  final String? resumeUrl;
  final bool    profileComplete;

  const TalentProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.bio,
    this.phone,
    this.resumeUrl,
    required this.profileComplete,
  });

  factory TalentProfile.fromJson(Map<String, dynamic> j) => TalentProfile(
    id:              j['id'] as int,
    firstName:       j['first_name'] as String? ?? '',
    lastName:        j['last_name']  as String? ?? '',
    email:           j['email']      as String? ?? '',
    bio:             j['bio']        as String?,
    phone:           j['phone']      as String?,
    resumeUrl:       j['resume_url'] as String?,
    profileComplete: j['profile_complete'] as bool? ?? false,
  );

  bool get hasBio => bio != null && bio!.isNotEmpty;
}

// ── Education ─────────────────────────────────────────────────────────────────

class EducationRequest {
  final String institution;
  final String degree;
  final String fieldOfStudy;
  final String startYear;
  final String? endYear;

  const EducationRequest({
    required this.institution,
    required this.degree,
    required this.fieldOfStudy,
    required this.startYear,
    this.endYear,
  });

  Map<String, dynamic> toJson() => {
    'institution':    institution,
    'degree':         degree,
    'field_of_study': fieldOfStudy,
    'start_year':     startYear,
    if (endYear != null) 'end_year': endYear,
  };
}

// ── Certificate ───────────────────────────────────────────────────────────────

class CertificateRequest {
  final String name;
  final String issuingOrganization;

  const CertificateRequest({required this.name, required this.issuingOrganization});

  Map<String, dynamic> toJson() => {
    'name':                  name,
    'issuing_organization': issuingOrganization,
  };
}

// ── Work Experience ───────────────────────────────────────────────────────────

class WorkExperienceRequest {
  final String  company;
  final String  role;
  final String  startDate;
  final String? endDate;
  final String? description;
  final bool    isCurrent;

  const WorkExperienceRequest({
    required this.company,
    required this.role,
    required this.startDate,
    this.endDate,
    this.description,
    this.isCurrent = false,
  });

  Map<String, dynamic> toJson() => {
    'company':     company,
    'position':    role,
    'start_date':  startDate,
    if (endDate != null) 'end_date': endDate,
    if (description != null) 'description': description,
    'is_current':  isCurrent,
  };
}

// ── Skill ─────────────────────────────────────────────────────────────────────

class SkillRequest {
  final String name;
  final String? category;
  const SkillRequest({required this.name, this.category});
  Map<String, dynamic> toJson() => {'name': name, if (category != null) 'category': category};
}

// ── Hobby ─────────────────────────────────────────────────────────────────────

class HobbyRequest {
  final String name;
  const HobbyRequest({required this.name});
  Map<String, dynamic> toJson() => {'name': name};
}

// ── Language ──────────────────────────────────────────────────────────────────

class LanguageRequest {
  final String name;
  final String proficiency;
  const LanguageRequest({required this.name, required this.proficiency});
  Map<String, dynamic> toJson() => {'language': name, 'proficiency': proficiency};
}
