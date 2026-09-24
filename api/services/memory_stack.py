"""
NityaGeeta - Graph-Augmented Conversation Stack Memory Engine [MEM-01]
Uses NetworkX (nx.DiGraph) to model multi-turn conversations, tangents, deep-dives,
and topic returns as a Directed Acyclic Graph (DAG) with push/pop/squash mechanics.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import networkx as nx
from pydantic import BaseModel, Field


class TurnMessage(BaseModel):
    turn_id: int
    speaker: str  # "user" | "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    shlokas_cited: List[str] = []


class TopicNodeData(BaseModel):
    node_id: str
    name: str
    parent_id: Optional[str] = None
    status: str = "active"  # "main" | "active_tangent" | "collapsed"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    summary: Optional[str] = None
    turns: List[TurnMessage] = []


class ConversationGraphStack:
    """
    NetworkX-powered Directed Acyclic Graph (DAG) for managing conversation memory,
    tangent deep-dives, and topic squash-merges.
    """

    def __init__(self, root_topic: str = "Main Conversation Thread"):
        self.graph = nx.DiGraph()
        self.root_id = "node_root"
        self.active_node_id = self.root_id

        # Initialize Root Main Node in NetworkX Graph
        root_data = TopicNodeData(
            node_id=self.root_id,
            name=root_topic,
            status="main",
        )
        self.graph.add_node(self.root_id, data=root_data)

    def get_node_data(self, node_id: str) -> TopicNodeData:
        return self.graph.nodes[node_id]["data"]

    def add_message(
        self,
        speaker: str,
        content: str,
        shlokas_cited: Optional[List[str]] = None,
    ) -> TurnMessage:
        """Appends a message to the currently active topic node."""
        active_node = self.get_node_data(self.active_node_id)
        next_turn_id = len(active_node.turns) + 1

        msg = TurnMessage(
            turn_id=next_turn_id,
            speaker=speaker,
            content=content,
            shlokas_cited=shlokas_cited or [],
        )
        active_node.turns.append(msg)
        return msg

    def push_tangent(self, tangent_name: str) -> str:
        """
        PUSH a side-topic tangent onto the memory stack.
        Creates a child node in the NetworkX graph connected to the active parent.
        """
        parent_id = self.active_node_id
        new_node_id = f"tangent_{nx.number_of_nodes(self.graph) + 1}_{int(datetime.utcnow().timestamp())}"

        new_node = TopicNodeData(
            node_id=new_node_id,
            name=tangent_name,
            parent_id=parent_id,
            status="active_tangent",
        )

        # Add node and directed edge (Parent -> Child Tangent) in NetworkX
        self.graph.add_node(new_node_id, data=new_node)
        self.graph.add_edge(parent_id, new_node_id, relationship="has_tangent")

        # Set active context pointer to new tangent node
        self.active_node_id = new_node_id
        return new_node_id

    def pop_and_squash_tangent(self, custom_summary: Optional[str] = None) -> Optional[str]:
        """
        POP the active tangent off the stack and squash-merge its turns into a 1-line Sūtra summary.
        Restores active pointer back to the parent node.
        """
        if self.active_node_id == self.root_id:
            return None  # Cannot pop root main node

        current_node = self.get_node_data(self.active_node_id)
        parent_id = current_node.parent_id

        if not parent_id:
            return None

        # Generate Sūtra summary of tangent turns if not provided
        if not custom_summary:
            all_text = " ".join([t.content for t in current_node.turns])
            all_shlokas = list(set([s for t in current_node.turns for s in t.shlokas_cited]))
            shloka_str = f" (Cited: {', '.join(all_shlokas)})" if all_shlokas else ""
            custom_summary = f"[Sutra Summary: Explored '{current_node.name}'{shloka_str}]"

        current_node.status = "collapsed"
        current_node.summary = custom_summary

        # Re-parent active pointer back to parent node
        self.active_node_id = parent_id
        return custom_summary

    def get_optimized_context_prompt(self, max_recent_turns: int = 6) -> str:
        """
        Traverses NetworkX graph to build an optimized prompt context (< 1,500 tokens).
        Includes:
        1. Main Topic & Collapsed Tangent Sūtras
        2. Active Node Recent Turns
        """
        prompt_parts = []

        # 1. Traversal of all nodes in NetworkX Graph to collect collapsed summaries
        collapsed_summaries = []
        for n_id, n_data in self.graph.nodes(data=True):
            data: TopicNodeData = n_data["data"]
            if data.status == "collapsed" and data.summary:
                collapsed_summaries.append(f"- {data.summary}")

        if collapsed_summaries:
            prompt_parts.append("[PREVIOUS EXPLORED TANGENTS (Collapsed Sutras)]")
            prompt_parts.extend(collapsed_summaries)

        # 2. Active Node Context
        active_node = self.get_node_data(self.active_node_id)
        prompt_parts.append(f"\n[ACTIVE TOPIC FOCUS: {active_node.name}]")

        recent_turns = active_node.turns[-max_recent_turns:]
        for turn in recent_turns:
            shloka_meta = f" [Cited: {', '.join(turn.shlokas_cited)}]" if turn.shlokas_cited else ""
            prompt_parts.append(f"{turn.speaker.capitalize()}: {turn.content}{shloka_meta}")

        return "\n".join(prompt_parts)

    def export_graph_summary(self) -> Dict[str, Any]:
        """
        Exports NetworkX graph structure for inspection, debugging, and API serialization.
        """
        nodes_summary = []
        for n_id, n_data in self.graph.nodes(data=True):
            d: TopicNodeData = n_data["data"]
            nodes_summary.append({
                "id": d.node_id,
                "name": d.name,
                "status": d.status,
                "parent_id": d.parent_id,
                "turn_count": len(d.turns),
                "summary": d.summary,
            })

        edges = [{"source": u, "target": v} for u, v in self.graph.edges()]

        return {
            "root_id": self.root_id,
            "active_node_id": self.active_node_id,
            "total_nodes": nx.number_of_nodes(self.graph),
            "total_edges": nx.number_of_edges(self.graph),
            "nodes": nodes_summary,
            "edges": edges,
        }
