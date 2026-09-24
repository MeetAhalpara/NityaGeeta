"""
Unit test for NetworkX ConversationGraphStack memory engine [MEM-01]
"""

from api.services.memory_stack import ConversationGraphStack

def test_graph_memory_stack():
    print("Initializing ConversationGraphStack with NetworkX...")
    stack = ConversationGraphStack(root_topic="Startup Burnout & Karma Yoga")

    # Step 1: Add Main Thread Turns
    stack.add_message("user", "I am feeling burnt out at work.")
    stack.add_message("assistant", "Bhagavad Gita Chapter 2 Verse 47 teaches Nishkama Karma...", ["BG 2.47"])

    print("Initial Context:")
    print(stack.get_optimized_context_prompt())

    # Step 2: Push Tangent
    print("\n--- PUSHING TANGENT: Sanskrit Etymology of Phala ---")
    tangent_id = stack.push_tangent("Sanskrit Etymology of Phala")
    stack.add_message("user", "What does 'Phala' mean in Sanskrit?")
    stack.add_message("assistant", "Phala literally means fruit, reward, or outcome.", ["BG 2.47"])

    print("\nActive Context during Tangent:")
    print(stack.get_optimized_context_prompt())

    # Step 3: Pop and Squash Tangent
    print("\n--- POPPING & SQUASHING TANGENT ---")
    summary = stack.pop_and_squash_tangent()
    print("Generated Sutra Summary:", summary)

    # Step 4: Return to Main Thread
    stack.add_message("user", "So how do I apply this tomorrow morning at my startup?")
    stack.add_message("assistant", "Focus on your daily tasks without stress of results.", ["BG 3.19"])

    print("\nFinal Optimized Prompt Context:")
    print(stack.get_optimized_context_prompt())

    print("\nNetworkX Graph Summary Export:")
    summary_export = stack.export_graph_summary()
    print(f"Total Nodes: {summary_export['total_nodes']}, Total Edges: {summary_export['total_edges']}")
    for node in summary_export['nodes']:
        print(f"  - Node '{node['name']}' [{node['status']}] (Turns: {node['turn_count']})")

    assert summary_export['total_nodes'] == 2
    assert summary_export['total_edges'] == 1
    print("\n[PASS] All NetworkX Memory Stack tests passed successfully!")

if __name__ == "__main__":
    test_graph_memory_stack()
