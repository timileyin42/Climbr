class DashboardStats {
  final int    totalApplications;
  final int    totalTrainings;
  final int    inReview;
  final int    shortlisted;
  final int    profileCompletion;
  final List<FeaturedJob> featuredJobs;

  const DashboardStats({
    required this.totalApplications,
    required this.totalTrainings,
    required this.inReview,
    required this.shortlisted,
    required this.profileCompletion,
    required this.featuredJobs,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> j) => DashboardStats(
    totalApplications: j['total_applications'] as int? ?? 0,
    totalTrainings:    j['total_trainings']    as int? ?? 0,
    inReview:          j['applications_in_review'] as int? ?? 0,
    shortlisted:       j['shortlisted_applications'] as int? ?? 0,
    profileCompletion: j['profile_completion'] as int? ?? 0,
    featuredJobs: (j['featured_jobs'] as List<dynamic>? ?? [])
        .map((e) => FeaturedJob.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

class FeaturedJob {
  final int     id;
  final String  title;
  final String  employerName;
  final String  location;
  final String  jobType;
  final double? salaryMin;
  final double? salaryMax;
  final String? createdAt;

  const FeaturedJob({
    required this.id,
    required this.title,
    required this.employerName,
    required this.location,
    required this.jobType,
    this.salaryMin,
    this.salaryMax,
    this.createdAt,
  });

  factory FeaturedJob.fromJson(Map<String, dynamic> j) => FeaturedJob(
    id:           j['id']            as int,
    title:        j['title']         as String? ?? '',
    employerName: j['employer_name'] as String? ?? '',
    location:     j['location']      as String? ?? '',
    jobType:      j['job_type']      as String? ?? '',
    salaryMin:    (j['salary_min']   as num?)?.toDouble(),
    salaryMax:    (j['salary_max']   as num?)?.toDouble(),
    createdAt:    j['created_at']    as String?,
  );

  String get formattedSalary {
    if (salaryMin == null && salaryMax == null) return '';
    String fmt(double n) => n >= 1000 ? '₦${(n / 1000).toStringAsFixed(0)}k' : '₦${n.toStringAsFixed(0)}';
    if (salaryMin != null && salaryMax != null) return '${fmt(salaryMin!)} – ${fmt(salaryMax!)}';
    if (salaryMin != null) return 'From ${fmt(salaryMin!)}';
    return 'Up to ${fmt(salaryMax!)}';
  }
}
