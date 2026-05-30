// ── Section entry models (from GET /talent/profile nested data) ───────────────

class EducationEntry {
  final int     id;
  final String  institution;
  final String  degree;
  final String? fieldOfStudy;
  final String? startDate;
  final String? endDate;
  final bool    isCurrent;

  const EducationEntry({
    required this.id,
    required this.institution,
    required this.degree,
    this.fieldOfStudy,
    this.startDate,
    this.endDate,
    this.isCurrent = false,
  });

  factory EducationEntry.fromJson(Map<String, dynamic> j) => EducationEntry(
    id:           j['id']             as int,
    institution:  j['institution']    as String,
    degree:       j['degree']         as String,
    fieldOfStudy: j['field_of_study'] as String?,
    startDate:    j['start_date']     as String?,
    endDate:      j['end_date']       as String?,
    isCurrent:    j['is_current']     as bool? ?? false,
  );

  String get dateRange {
    final s = _year(startDate);
    if (isCurrent) return s != null ? '$s – Present' : 'Present';
    final e = _year(endDate);
    if (s != null && e != null) return '$s – $e';
    return s ?? e ?? '';
  }

  String? _year(String? iso) {
    if (iso == null) return null;
    try { return DateTime.parse(iso).year.toString(); } catch (_) { return iso.length >= 4 ? iso.substring(0, 4) : iso; }
  }
}

class WorkEntry {
  final int     id;
  final String  company;
  final String  position;
  final String? location;
  final String? startDate;
  final String? endDate;
  final bool    isCurrent;
  final String? description;

  const WorkEntry({
    required this.id,
    required this.company,
    required this.position,
    this.location,
    this.startDate,
    this.endDate,
    this.isCurrent = false,
    this.description,
  });

  factory WorkEntry.fromJson(Map<String, dynamic> j) => WorkEntry(
    id:          j['id']          as int,
    company:     j['company']     as String,
    position:    j['position']    as String,
    location:    j['location']    as String?,
    startDate:   j['start_date']  as String?,
    endDate:     j['end_date']    as String?,
    isCurrent:   j['is_current']  as bool? ?? false,
    description: j['description'] as String?,
  );

  String get dateRange {
    final s = _fmt(startDate);
    if (isCurrent) return s != null ? '$s – Present' : 'Present';
    final e = _fmt(endDate);
    if (s != null && e != null) return '$s – $e';
    return s ?? e ?? '';
  }

  String? _fmt(String? iso) {
    if (iso == null) return null;
    try {
      final d = DateTime.parse(iso);
      const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return '${m[d.month - 1]} ${d.year}';
    } catch (_) { return iso; }
  }
}

class CertEntry {
  final int    id;
  final String name;
  final String issuingOrganization;

  const CertEntry({required this.id, required this.name, required this.issuingOrganization});

  factory CertEntry.fromJson(Map<String, dynamic> j) => CertEntry(
    id:                   j['id']                   as int,
    name:                 j['name']                 as String,
    issuingOrganization: j['issuing_organization'] as String,
  );
}

class SkillEntry {
  final int     id;
  final String  name;
  final String? category;

  const SkillEntry({required this.id, required this.name, this.category});

  factory SkillEntry.fromJson(Map<String, dynamic> j) => SkillEntry(
    id:       j['id']       as int,
    name:     j['name']     as String,
    category: j['category'] as String?,
  );
}

class HobbyEntry {
  final int    id;
  final String name;

  const HobbyEntry({required this.id, required this.name});

  factory HobbyEntry.fromJson(Map<String, dynamic> j) => HobbyEntry(
    id:   j['id']   as int,
    name: j['name'] as String,
  );
}

class LanguageEntry {
  final int    id;
  final String name;
  final String proficiency;

  const LanguageEntry({required this.id, required this.name, required this.proficiency});

  factory LanguageEntry.fromJson(Map<String, dynamic> j) => LanguageEntry(
    id:          j['id']          as int,
    name:        j['name']        as String,
    proficiency: j['proficiency'] as String,
  );
}

// ── Full profile aggregate ────────────────────────────────────────────────────

class FullProfile {
  final int                  id;
  final String               firstName;
  final String               lastName;
  final String               email;
  final String?              bio;
  final String?              phone;
  final String?              profileImageUrl;
  final String?              resumeUrl;
  final int                  profileCompletion;
  final List<EducationEntry> education;
  final List<WorkEntry>      workExperience;
  final List<SkillEntry>     skills;
  final List<CertEntry>      certificates;
  final List<HobbyEntry>     hobbies;
  final List<LanguageEntry>  languages;

  const FullProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.bio,
    this.phone,
    this.profileImageUrl,
    this.resumeUrl,
    required this.profileCompletion,
    this.education      = const [],
    this.workExperience = const [],
    this.skills         = const [],
    this.certificates   = const [],
    this.hobbies        = const [],
    this.languages      = const [],
  });

  String get fullName => '$firstName $lastName'.trim();

  factory FullProfile.fromJson(Map<String, dynamic> j) {
    final p = j['profile'] as Map<String, dynamic>? ?? {};

    List<T> parse<T>(String key, T Function(Map<String, dynamic>) fn) {
      final raw = p[key];
      if (raw == null) return [];
      return (raw as List<dynamic>).map((e) => fn(e as Map<String, dynamic>)).toList();
    }

    return FullProfile(
      id:                j['id']                  as int,
      firstName:         j['first_name']           as String? ?? '',
      lastName:          j['last_name']            as String? ?? '',
      email:             j['email']                as String? ?? '',
      bio:               j['bio']                  as String?,
      phone:             j['phone']                as String?,
      profileImageUrl:   j['profile_image_url']    as String?,
      resumeUrl:         j['resume_url']           as String?,
      profileCompletion: j['profile_completion']   as int? ?? 0,
      education:      parse('education',      EducationEntry.fromJson),
      workExperience: parse('work_experience', WorkEntry.fromJson),
      skills:         parse('skills',         SkillEntry.fromJson),
      certificates:   parse('certificates',   CertEntry.fromJson),
      hobbies:        parse('hobbies',        HobbyEntry.fromJson),
      languages:      parse('languages',      LanguageEntry.fromJson),
    );
  }
}
