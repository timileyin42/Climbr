import 'jobs_models.dart';

// ── Saved Job ─────────────────────────────────────────────────────────────────

class SavedJob {
  final int    id;       // saved_job record id
  final int    jobId;
  final String createdAt;
  final Job    job;

  const SavedJob({required this.id, required this.jobId, required this.createdAt, required this.job});

  factory SavedJob.fromJson(Map<String, dynamic> j) => SavedJob(
    id:        j['id']         as int,
    jobId:     j['job_id']     as int,
    createdAt: j['created_at'] as String,
    job:       Job.fromJson(j['job'] as Map<String, dynamic>),
  );
}

// ── Saved Training ────────────────────────────────────────────────────────────

class SavedTraining {
  final int      id;
  final int      trainingId;
  final String   createdAt;
  final Training training;

  const SavedTraining({required this.id, required this.trainingId, required this.createdAt, required this.training});

  factory SavedTraining.fromJson(Map<String, dynamic> j) => SavedTraining(
    id:         j['id']          as int,
    trainingId: j['training_id'] as int,
    createdAt:  j['created_at']  as String,
    training:   Training.fromJson(j['training'] as Map<String, dynamic>),
  );
}

// ── Application ───────────────────────────────────────────────────────────────

class ApplicationItem {
  final int    id;
  final String type;           // "Job" | "Training"
  final String title;
  final String companyProvider;
  final String dateApplied;
  final String status;
  final String createdAt;

  const ApplicationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.companyProvider,
    required this.dateApplied,
    required this.status,
    required this.createdAt,
  });

  factory ApplicationItem.fromJson(Map<String, dynamic> j) => ApplicationItem(
    id:              j['id']               as int,
    type:            j['type']             as String? ?? 'Job',
    title:           j['title']            as String? ?? '',
    companyProvider: j['company_provider'] as String? ?? '',
    dateApplied:     j['date_applied']     as String? ?? '',
    status:          j['status']           as String? ?? 'applied',
    createdAt:       j['created_at']?.toString() ?? '',
  );

  bool get isJob => type == 'Job';

  String get displayStatus {
    switch (status) {
      case 'applied':     return 'Pending';
      case 'in_review':   return 'In Review';
      case 'shortlisted': return 'Shortlisted';
      case 'accepted':    return 'Accepted';
      case 'rejected':    return 'Rejected';
      default:            return status;
    }
  }
}

class ApplicationStats {
  final int total;
  final int inReview;
  final int acceptedShortlisted;
  final int rejected;

  const ApplicationStats({
    required this.total,
    required this.inReview,
    required this.acceptedShortlisted,
    required this.rejected,
  });

  factory ApplicationStats.fromJson(Map<String, dynamic> j) => ApplicationStats(
    total:                j['total_applications']  as int? ?? 0,
    inReview:             j['in_review']           as int? ?? 0,
    acceptedShortlisted:  j['accepted_shortlisted']as int? ?? 0,
    rejected:             j['rejected']            as int? ?? 0,
  );
}
