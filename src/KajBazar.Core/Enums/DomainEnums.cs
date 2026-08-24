namespace KajBazar.Core.Enums
{
    public enum UserRoleType
    {
        Admin = 1,
        Consumer = 2,
        ServiceProvider = 3
    }

    public enum VerificationStatus
    {
        Pending = 1,
        Verified = 2,
        Rejected = 3,
        Suspended = 4
    }

    public enum RecommendationStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3
    }

    public enum ReportStatus
    {
        Open = 1,
        UnderReview = 2,
        Resolved = 3,
        Dismissed = 4
    }
}
