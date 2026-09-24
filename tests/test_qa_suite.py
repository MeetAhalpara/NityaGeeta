"""
NityaGeeta - Enterprise Automated QA & QT Suite (Parīkṣā Test Suite)
Tests end-to-end memory stack DAG operations, API payloads, and state transitions.
"""

import unittest
import json
from api.services.memory_stack import ConversationGraphStack, TopicNodeData, TurnMessage


class TestNityaGeetaMemoryQA(unittest.TestCase):

    def setUp(self):
        """Initialize clean test environment before each test run."""
        self.stack = ConversationGraphStack(root_topic="Karma Yoga & Workplace Stress")

    def test_01_root_initialization(self):
        """Verify root node initialization and networkx graph structure."""
        summary = self.stack.export_graph_summary()
        self.assertEqual(summary["total_nodes"], 1)
        self.assertEqual(summary["total_edges"], 0)
        self.assertEqual(summary["nodes"][0]["status"], "main")
        self.assertEqual(summary["nodes"][0]["name"], "Karma Yoga & Workplace Stress")

    def test_02_turn_message_addition(self):
        """Verify adding turn messages to active topic node."""
        msg1 = self.stack.add_message("user", "How do I overcome stress at my startup?")
        msg2 = self.stack.add_message("assistant", "Bhagavad Gita 2.47 advises Nishkama Karma.", ["BG 2.47"])

        self.assertEqual(msg1.turn_id, 1)
        self.assertEqual(msg2.turn_id, 2)
        self.assertIn("BG 2.47", msg2.shlokas_cited)

    def test_03_tangent_push_and_pop(self):
        """Verify PUSH and POP tangent branching lifecycle in NetworkX."""
        # Add root turn
        self.stack.add_message("user", "What is duty?")

        # Push Tangent
        tangent_id = self.stack.push_tangent("Sanskrit Root of Karma")
        self.assertEqual(self.stack.active_node_id, tangent_id)

        # Add message in tangent
        self.stack.add_message("user", "Etymology of Karma?")
        self.stack.add_message("assistant", "Derived from root 'Kri' (to do).")

        # Pop and Squash Tangent
        sutra_summary = self.stack.pop_and_squash_tangent()
        self.assertTrue(sutra_summary.startswith("[Sutra Summary:"))
        self.assertEqual(self.stack.active_node_id, self.stack.root_id)

        # Context prompt verification
        context_prompt = self.stack.get_optimized_context_prompt()
        self.assertIn("[PREVIOUS EXPLORED TANGENTS (Collapsed Sutras)]", context_prompt)
        self.assertIn("Sanskrit Root of Karma", context_prompt)

    def test_04_export_schema_integrity(self):
        """Verify exported graph summary matches JSON schema requirements."""
        self.stack.push_tangent("Dhyana Yoga")
        self.stack.pop_and_squash_tangent()

        summary = self.stack.export_graph_summary()
        self.assertIn("root_id", summary)
        self.assertIn("active_node_id", summary)
        self.assertIn("nodes", summary)
        self.assertIn("edges", summary)
        self.assertEqual(len(summary["nodes"]), 2)
        self.assertEqual(len(summary["edges"]), 1)


if __name__ == "__main__":
    unittest.main()
