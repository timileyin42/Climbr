class Job {
  final int     id;
  final String  title;
  final String? description;
  final String  location;
  final String  jobType;
  final String  employerName;
  final String? industry;
  final double? salaryMin;
  final double? salaryMax;
  final String? imageUrl;
  final String? highlights;
  final String  createdAt;

  const Job({
    required this.id,
    required this.title,
    this.description,
    required this.location,
    required this.jobType,
    required this.employerName,
    this.industry,
    this.salaryMin,
    this.salaryMax,
    this.imageUrl,
    this.highlights,
    required this.createdAt,
  });

  factory Job.fromJson(Map<String, dynamic> j) => Job(
    id:           j['id']           as int,
    title:        j['title']        as String,
    description:  j['description']  as String?,
    location:     j['location']     as String,
    jobType:      j['job_type']     as String,
    employerName: j['employer_name']as String,
    industry:     j['industry']     as String?,
    salaryMin:    (j['salary_min']  as num?)?.toDouble(),
    salaryMax:    (j['salary_max']  as num?)?.toDouble(),
    imageUrl:     j['image_url']    as String?,
    highlights:   j['highlights']   as String?,
    createdAt:    j['created_at']   as String,
  );

  String get formattedType => jobType.replaceAll('_', '-');

  String get formattedSalary {
    if (salaryMin == null && salaryMax == null) return '';
    String fmt(double n) => n >= 1000000 ? '₦${(n/1000000).toStringAsFixed(1)}M'
        : n >= 1000 ? '₦${(n/1000).toStringAsFixed(0)}k' : '₦${n.toStringAsFixed(0)}';
    if (salaryMin != null && salaryMax != null) return '${fmt(salaryMin!)} – ${fmt(salaryMax!)}';
    if (salaryMin != null) return 'From ${fmt(salaryMin!)}';
    return 'Up to ${fmt(salaryMax!)}';
  }

  String timeAgo() {
    try {
      final d = DateTime.now().difference(DateTime.parse(createdAt)).inDays;
      if (d == 0) return 'Today';
      if (d == 1) return '1 day ago';
      if (d < 7) return '$d days ago';
      if (d < 14) return '1 week ago';
      return '${(d / 7).floor()} weeks ago';
    } catch (_) { return ''; }
  }
}

// ── Job Detail (extends Job with applicant count + status) ───────────────────

class JobDetail extends Job {
  final int    applicantCount;
  final String status;
  final String? companySize;
  final String? experienceLevel;

  const JobDetail({
    required super.id,
    required super.title,
    super.description,
    required super.location,
    required super.jobType,
    required super.employerName,
    super.industry,
    super.salaryMin,
    super.salaryMax,
    super.imageUrl,
    super.highlights,
    required super.createdAt,
    required this.applicantCount,
    required this.status,
    this.companySize,
    this.experienceLevel,
  });

  factory JobDetail.fromJson(Map<String, dynamic> j) => JobDetail(
    id:              j['id']              as int,
    title:           j['title']           as String,
    description:     j['description']     as String?,
    location:        j['location']        as String,
    jobType:         j['job_type']        as String,
    employerName:    j['employer_name']   as String,
    industry:        j['industry']        as String?,
    salaryMin:       (j['salary_min']     as num?)?.toDouble(),
    salaryMax:       (j['salary_max']     as num?)?.toDouble(),
    imageUrl:        j['image_url']       as String?,
    highlights:      j['highlights']      as String?,
    createdAt:       j['created_at']      as String,
    applicantCount:  j['applicant_count'] as int?    ?? 0,
    status:          j['status']          as String? ?? 'active',
    companySize:     j['company_size']    as String?,
    experienceLevel: j['experience_level']as String?,
  );
}

// ── Training Detail ───────────────────────────────────────────────────────────

class TrainingDetail extends Training {
  final int     applicantCount;
  final String? endDate;
  final String? duration;
  final String? level;
  final int?    openSlots;
  final String? curriculum;

  const TrainingDetail({
    required super.id,
    required super.title,
    super.description,
    required super.category,
    super.location,
    required super.cost,
    required super.deliveryMethod,
    required super.trainerName,
    required super.startDate,
    super.highlights,
    required super.createdAt,
    required this.applicantCount,
    this.endDate,
    this.duration,
    this.level,
    this.openSlots,
    this.curriculum,
  });

  factory TrainingDetail.fromJson(Map<String, dynamic> j) => TrainingDetail(
    id:             j['id']              as int,
    title:          j['title']           as String,
    description:    j['description']     as String?,
    category:       j['category']        as String,
    location:       j['location']        as String?,
    cost:           (j['cost']           as num).toDouble(),
    deliveryMethod: j['delivery_method'] as String,
    trainerName:    j['trainer_name']    as String,
    startDate:      j['start_date']      as String,
    highlights:     j['highlights']      as String?,
    createdAt:      j['created_at']      as String,
    applicantCount: j['applicant_count'] as int?    ?? 0,
    endDate:        j['end_date']        as String?,
    duration:       j['duration']        as String?,
    level:          j['level']           as String?,
    openSlots:      j['open_slots']      as int?,
    curriculum:     j['curriculum']      as String?,
  );
}

class Training {
  final int     id;
  final String  title;
  final String? description;
  final String  category;
  final String? location;
  final double  cost;
  final String  deliveryMethod;
  final String  trainerName;
  final String  startDate;
  final String? highlights;
  final String  createdAt;

  const Training({
    required this.id,
    required this.title,
    this.description,
    required this.category,
    this.location,
    required this.cost,
    required this.deliveryMethod,
    required this.trainerName,
    required this.startDate,
    this.highlights,
    required this.createdAt,
  });

  factory Training.fromJson(Map<String, dynamic> j) => Training(
    id:             j['id']             as int,
    title:          j['title']          as String,
    description:    j['description']    as String?,
    category:       j['category']       as String,
    location:       j['location']       as String?,
    cost:           (j['cost'] as num).toDouble(),
    deliveryMethod: j['delivery_method']as String,
    trainerName:    j['trainer_name']   as String,
    startDate:      j['start_date']     as String,
    highlights:     j['highlights']     as String?,
    createdAt:      j['created_at']     as String,
  );

  String get formattedDelivery => deliveryMethod.replaceAll('_', ' ');
  String get formattedCost => cost == 0 ? 'Free' : '₦${cost.toStringAsFixed(0)}';
}
