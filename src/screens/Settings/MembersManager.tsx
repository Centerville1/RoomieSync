import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { Avatar, Button, Card } from "../../components/UI";
import { houseService } from "../../services/houseService";
import { HouseMembership } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";
import { useUserTheme } from "../../hooks/useUserTheme";

interface MembersManagerProps {
  houseId: string;
  isAdmin: boolean;
}

const MembersManager: React.FC<MembersManagerProps> = ({
  houseId,
  isAdmin,
}) => {
  const { user } = useAuth();
  const { COLORS } = useUserTheme();
  const [members, setMembers] = useState<HouseMembership[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [houseId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const house = await houseService.getHouseDetails(houseId);
      setMembers(house.members || house.memberships || []);
    } catch (err) {
      Alert.alert("Error", "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (
    membershipId: string,
    role: "admin" | "member" = "admin"
  ) => {
    if (role === "admin") {
      Alert.alert(
        "Promote to Admin",
        "Admin gives full privileges to modify or delete the house. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Promote",
            style: "destructive",
            onPress: async () => {
              try {
                await houseService.updateMemberRole(
                  houseId,
                  membershipId,
                  role
                );
                fetchMembers();
              } catch (err) {
                Alert.alert("Error", "Failed to set role to admin");
              }
            },
          },
        ]
      );
      return;
    }
    // Demote to member (no warning needed)
    try {
      await houseService.updateMemberRole(houseId, membershipId, role);
      fetchMembers();
    } catch (err) {
      Alert.alert("Error", "Failed to set role to member");
    }
  };

  const handleRemove = async (membershipId: string) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member from the house?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await houseService.removeMember(houseId, membershipId);
              fetchMembers();
            } catch (err) {
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: HouseMembership }) => {
    const color = item.user?.color || "#6B7280";
    const isSelf = item.user?.id === user?.id;
    return (
      <View style={[styles.memberRow, { borderBottomColor: COLORS.BORDER }]}>
        <Avatar
          imageUrl={item.user?.profileImageUrl}
          name={item.displayName || item.user?.firstName || ""}
          size="medium"
        />
        <Text style={[styles.memberName, { color: COLORS.TEXT_PRIMARY }]}>
          {item.displayName || item.user?.firstName}
        </Text>
        {isSelf && <Text style={{ color: COLORS.TEXT_INACTIVE }}> (You) </Text>}
        <Text style={[styles.role, { color: COLORS.TEXT_INACTIVE }]}>
          {" "}
          {item.role === "admin" ? "Admin" : "Member"}{" "}
        </Text>
        {isAdmin && item.role !== "admin" && !isSelf && (
          <Button
            title="Promote"
            onPress={() => handlePromote(item.id)}
            variant="outline"
            size="small"
            style={{ marginRight: 8 }}
          />
        )}
        {isAdmin && item.role === "admin" && !isSelf && (
          <Button
            title="Demote"
            onPress={() => handlePromote(item.id, "member")}
            variant="outline"
            size="small"
            style={{ marginRight: 8 }}
          />
        )}
        {isAdmin && !isSelf && (
          <Button
            title="Remove"
            onPress={() => handleRemove(item.id)}
            variant="danger"
            size="small"
          />
        )}
      </View>
    );
  };

  if (loading) return <Text>Loading members...</Text>;

  return (
    <Card title="House Members" headerColor={COLORS.BALANCE_HEADER}>
      <View style={styles.container}>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
        {!isAdmin && (
          <Text style={{ color: COLORS.TEXT_INACTIVE, fontSize: 13, marginTop: 8 }}>
            Only admins can manage members. You can view the list of house
            members here.
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  role: {
    fontSize: 14,
    marginRight: 8,
  },
});

export default MembersManager;
