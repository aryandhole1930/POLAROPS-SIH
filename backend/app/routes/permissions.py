ROLE_PERMISSIONS = {
    "programme_admin": {
        "mission_view",
        "mission_create",
        "mission_edit",
        "cargo_view",
        "cargo_create",
        "cargo_edit",
        "emergency_view",
        "emergency_create",
        "emergency_edit",
    },

    "expedition_leader": {
        "mission_view",
        "mission_create",
        "mission_edit",
        "cargo_view",
        "cargo_create",
        "cargo_edit",
        "emergency_view",
        "emergency_create",
        "emergency_edit",
    },

    "station_leader": {
        "mission_view",
        "mission_edit",
        "cargo_view",
        "cargo_edit",
        "emergency_view",
        "emergency_create",
        "emergency_edit",
    },

    "senior_scientist": {
        "mission_view",
        "mission_create",
        "mission_edit",
        "cargo_view",
        "cargo_create",
        "emergency_view",
        "emergency_create",
    },

    "logistics_officer": {
        "mission_view",
        "cargo_view",
        "cargo_create",
        "cargo_edit",
        "emergency_view",
        "emergency_create",
        "emergency_edit",
    },

    "expedition_member": {
        "mission_view",
        "cargo_view",
        "emergency_view",
        "emergency_create",
    },
}


def has_permission(role: str, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())