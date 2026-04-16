"""Mobile BFF — SCAFFOLD for future iOS / Android apps.

Mobile needs (v3):
  - Compressed payloads (fewer fields, smaller numbers)
  - Pagination for positions list
  - Push notification metadata for price alerts
  - Offline-friendly delta-sync responses

TODO: Implement when building the iOS / Android apps in v3.
"""


def shape_portfolio_response(portfolio, page: int = 1, page_size: int = 20):
    """SCAFFOLD: compressed fields and pagination for mobile.

    Raises:
        NotImplementedError: Mobile BFF activates in v3 with iOS/Android app.
    """
    raise NotImplementedError("Mobile BFF activates in v3 with iOS/Android app")


def shape_hedge_response(recommendations):
    """SCAFFOLD: abbreviated fields for mobile bandwidth.

    Raises:
        NotImplementedError: Mobile BFF activates in v3 with iOS/Android app.
    """
    raise NotImplementedError("Mobile BFF activates in v3 with iOS/Android app")
