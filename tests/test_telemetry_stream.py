import unittest
from fastapi.testclient import TestClient
from api.main import app
from api.services.telemetry_stream import (
    ingest_telemetry_event,
    get_seeker_affinity,
    generate_steve_jobs_followup,
    CHAPTER_MOTIFS
)

client = TestClient(app)

class TestTelemetryStreamAndFollowUp(unittest.TestCase):
    def setUp(self):
        self.user_id = "seeker_test_suite_42"

    def test_ingest_telemetry_event(self):
        """Test stream event ingestion for dwell and interaction."""
        res = ingest_telemetry_event(
            user_id=self.user_id,
            event_type="reading_dwell",
            shloka_id="BG_02_47",
            chapter=2,
            verse=47,
            dwell_ms=14500,
            interactions=["gloss_hover", "copy_sanskrit"]
        )
        self.assertEqual(res["status"], "ingested")
        self.assertEqual(res["user_id"], self.user_id)

    def test_seeker_affinity_aggregation(self):
        """Test that sustained engagement on Chapter 2 reflects Sankhya & Karma Yoga motif."""
        # Ingest reading events
        ingest_telemetry_event(
            user_id="seeker_affinity_user",
            event_type="reading_dwell",
            shloka_id="BG_02_47",
            chapter=2,
            verse=47,
            dwell_ms=45000
        )
        ingest_telemetry_event(
            user_id="seeker_affinity_user",
            event_type="reading_dwell",
            shloka_id="BG_02_14",
            chapter=2,
            verse=14,
            dwell_ms=25000
        )

        affinity = get_seeker_affinity("seeker_affinity_user")
        self.assertEqual(affinity["dominant_chapter"], 2)
        self.assertEqual(affinity["dominant_motif"], CHAPTER_MOTIFS[2]["name"])
        self.assertEqual(affinity["contemplation_level"], "deep")
        self.assertGreaterEqual(affinity["total_dwell_seconds"], 70.0)

    def test_steve_jobs_followup_burnout_structure(self):
        """Verify the Steve Jobs 3-pathway methodology with resonance check for burnout query."""
        followup = generate_steve_jobs_followup(
            question="Why do I feel so restless and burned out?",
            citations=[{"chapter": 2, "verse": 47}],
            user_id=self.user_id
        )

        # Check resonance question
        self.assertIn("resonance_check", followup)
        self.assertIn("room to breathe", followup["resonance_check"])

        # Check exactly 3 actionable pathways
        pathways = followup["pathways"]
        self.assertEqual(len(pathways), 3)

        ids = [p["id"] for p in pathways]
        self.assertIn("deepen_scripture", ids)
        self.assertIn("real_life_action", ids)
        self.assertIn("original_sanskrit", ids)

        # Verify verb-led action labels
        labels = [p["label"] for p in pathways]
        self.assertIn("Go Deeper into the Scripture", labels)
        self.assertIn("Bring It to Real Life", labels)
        self.assertIn("Read the Original Sanskrit", labels)

        # Verify all prompt and descriptions are rich and non-empty
        for p in pathways:
            self.assertTrue(len(p["prompt"]) > 10)
            self.assertTrue(len(p["description"]) > 10)

    def test_steve_jobs_followup_grief_structure(self):
        """Verify grief query produces compassionate soul-continuity pathways."""
        followup = generate_steve_jobs_followup(
            question="I lost my grandfather and I am dealing with profound grief and mourning",
            citations=[{"chapter": 2, "verse": 20}],
            user_id=self.user_id
        )
        self.assertIn("unshakeable soul", followup["resonance_check"])
        self.assertEqual(len(followup["pathways"]), 3)
        self.assertTrue(any("2.20" in p["prompt"] or "2, Verse 20" in p["prompt"] for p in followup["pathways"]))

    def test_steve_jobs_followup_duty_structure(self):
        """Verify career/duty query produces Svadharma pathways."""
        followup = generate_steve_jobs_followup(
            question="I am confused about my career choice and dilemma between paths",
            citations=[{"chapter": 3, "verse": 35}],
            user_id=self.user_id
        )
        self.assertIn("boundary between your duty", followup["resonance_check"])
        self.assertEqual(len(followup["pathways"]), 3)

    def test_telemetry_fastapi_endpoints(self):
        """Test API endpoints /api/v1/telemetry/stream and /api/v1/telemetry/affinity."""
        payload = {
            "events": [
                {
                    "user_id": "api_test_user_99",
                    "event_type": "reading_dwell",
                    "shloka_id": "BG_02_14",
                    "chapter": 2,
                    "verse": 14,
                    "dwell_ms": 8500,
                    "interactions": ["highlight"]
                }
            ]
        }
        res = client.post("/api/v1/telemetry/stream", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["ingested_count"], 1)

        # Test affinity endpoint
        aff_res = client.get("/api/v1/telemetry/affinity/api_test_user_99")
        self.assertEqual(aff_res.status_code, 200)
        aff_data = aff_res.json()
        self.assertEqual(aff_data["dominant_chapter"], 2)
        self.assertEqual(aff_data["dominant_motif"], CHAPTER_MOTIFS[2]["name"])
