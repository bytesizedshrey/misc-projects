//
//  FlatGlassView.swift
//  Login
//
//  Created by Shreyash Gajbhiye on 17/08/23.
//

import SwiftUI

struct FlatGlassView: ViewModifier {
  func body(content: Content) -> some View {
    if #available(iOS 15.0, *) {
      content
        .padding()
        .frame(height: 50)
        .background(.ultraThinMaterial)
        .cornerRadius(14)
    } else {
      // Fallback on earlier versions
      content
        .padding()
        .frame(height: 50)
        .cornerRadius(14)
    }
  }
}

//struct FlatGlassView_Previews: PreviewProvider {
//    static var previews: some View {
//        FlatGlassView()
//    }
//}
