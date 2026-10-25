import { Image, Linking, Modal, ScrollView, Text, View } from "react-native";
import { Action } from "./Action";
import { Icon } from "./Icon";
import { styles } from "./styles";
import { colors } from "./theme";

const links = [
  { label: "개발자", value: "wookingwoo", icon: "person-outline" as const, url: "https://wookingwoo.com" },
  { label: "문의 · 제안", value: "contact@wookingwoo.com", icon: "mail-outline" as const, url: "mailto:contact@wookingwoo.com" },
  { label: "오픈소스", value: "wookingwoo/namsigdang-app", icon: "logo-github" as const, url: "https://github.com/wookingwoo/namsigdang-app" },
];

export function AboutSheet({ visible, onClose, compact }: { visible: boolean; onClose: () => void; compact: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent accessibilityLabel="서비스 정보">
      <View style={[styles.modalOverlay, compact && styles.modalOverlayCompact]}>
        <View style={styles.modalCard} accessibilityViewIsModal>
          <View style={styles.aboutModalHeader}>
            <Text accessibilityRole="header" style={styles.aboutModalTitle}>서비스 정보</Text>
            <Action accessibilityRole="button" accessibilityLabel="닫기" onPress={onClose} style={({ pressed }) => [styles.aboutModalCloseButton, pressed && styles.pressed]}>
              <Icon name="close" size={24} color={colors.ink} />
            </Action>
          </View>
          <ScrollView contentContainerStyle={styles.aboutModalContent}>
            <View style={styles.infoCardHeader}>
              <Image source={require("../../../assets/favicon.png")} style={styles.infoCardIcon} accessible={false} />
              <View style={styles.infoCardTitleWrap}>
                <Text style={styles.infoTitle}>남식당</Text>
                <Text style={styles.infoDescription}>남도학숙의 하루 세 끼</Text>
              </View>
            </View>
            <Text style={styles.infoDescription}>사생 여러분이 식단을 편하게 확인할 수 있도록 만든 생활 편의 공익 서비스예요. 은평관과 동작관의 아침, 점심, 저녁 식단을 한곳에서 확인하세요.</Text>
            <View style={styles.infoLinkList}>
              {links.map((link) => <Action key={link.url} accessibilityRole="link" accessibilityLabel={link.label + ", " + link.value} onPress={() => void Linking.openURL(link.url)}
                style={({ pressed }) => [styles.infoLinkRow, pressed && styles.pressed]}>
                <View style={styles.infoLinkIconWrap}><Icon name={link.icon} size={22} color={colors.brandDark} /></View>
                <View style={styles.infoLinkTextWrap}>
                  <Text style={styles.infoLinkLabel}>{link.label}</Text>
                  <Text style={styles.infoLinkValue}>{link.value}</Text>
                </View>
                <Icon name="open-outline" size={17} color={colors.inkSoft} />
              </Action>)}
            </View>
            <Text style={styles.modalFootnote}>불편한 점이나 아이디어를 들려주세요.{"\n"}GitHub Issue와 PR을 통한 기여도 환영해요.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
